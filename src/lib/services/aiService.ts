import { Article, AnalysisLevel, AiInsight, Insight, InsightCategory, InsightComparison } from '../models/article';
import { v4 as uuidv4 } from 'uuid';

/**
 * AIサービスのインターフェース
 */
export interface AiService {
  /**
   * 記事を分析してインサイトを抽出する
   * @param article 分析対象の記事
   * @param level 分析レベル
   * @returns AIが生成したインサイト
   */
  analyzeArticle(article: Article, level: AnalysisLevel): Promise<AiInsight[]>;

  /**
   * ユーザーのインサイトとAIのインサイトを比較する
   * @param userInsights ユーザーのインサイト
   * @param aiInsights AIのインサイト
   * @returns インサイトの比較結果
   */
  compareInsights(userInsights: Insight[], aiInsights: AiInsight[]): Promise<InsightComparison[]>;
}

/**
 * OpenAI APIを使用したAIサービスの実装
 */
export class OpenAiService implements AiService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  /**
   * コンストラクタ
   */
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';

    if (!this.apiKey) {
      console.warn('OpenAI API Key が設定されていません。一部の機能が制限されます。');
    }
  }

  /**
   * 記事を分析してインサイトを抽出する
   * @param article 分析対象の記事
   * @param level 分析レベル
   * @returns AIが生成したインサイト
   */
  async analyzeArticle(article: Article, level: AnalysisLevel): Promise<AiInsight[]> {
    try {
      if (!this.apiKey) {
        return this.getMockAiInsights();
      }

      // プロンプトの作成
      const prompt = this.createArticleAnalysisPrompt(article, level);

      // APIの呼び出し
      const response = await this.callOpenAiApi(prompt);

      // レスポンスの解析
      return this.parseAiInsights(response);
    } catch (error) {
      console.error('AIによる記事分析エラー:', error);
      // エラー時はモックデータを返す
      return this.getMockAiInsights();
    }
  }

  /**
   * ユーザーのインサイトとAIのインサイトを比較する
   * @param userInsights ユーザーのインサイト
   * @param aiInsights AIのインサイト
   * @returns インサイトの比較結果
   */
  async compareInsights(userInsights: Insight[], aiInsights: AiInsight[]): Promise<InsightComparison[]> {
    try {
      if (!this.apiKey || userInsights.length === 0 || aiInsights.length === 0) {
        return this.createSimpleComparisons(userInsights, aiInsights);
      }

      // プロンプトの作成
      const prompt = this.createInsightComparisonPrompt(userInsights, aiInsights);

      // APIの呼び出し
      const response = await this.callOpenAiApi(prompt);

      // レスポンスの解析
      return this.parseComparisonResults(response, userInsights, aiInsights);
    } catch (error) {
      console.error('インサイト比較エラー:', error);
      // エラー時は単純な比較を行う
      return this.createSimpleComparisons(userInsights, aiInsights);
    }
  }

  /**
   * 記事分析用のプロンプトを作成
   * @param article 分析対象の記事
   * @param level 分析レベル
   * @returns プロンプト
   */
  private createArticleAnalysisPrompt(article: Article, level: AnalysisLevel): string {
    // 分析レベルに応じた詳細度設定
    let detailLevel = '';
    let insightCount = 3;

    switch (level) {
      case AnalysisLevel.BASIC:
        detailLevel = '基本的な分析を行い、主要な考えや重要な点を特定してください。';
        insightCount = 3;
        break;
      case AnalysisLevel.ADVANCED:
        detailLevel = '詳細な分析を行い、主要な考えだけでなく、裏付け証拠、反論点、意味合いなども特定してください。';
        insightCount = 5;
        break;
      case AnalysisLevel.EXPERT:
        detailLevel = '専門家レベルの深い分析を行い、主要な考え、裏付け証拠、反論点、意味合い、限界、推奨事項、疑問点など、多角的な視点から分析してください。';
        insightCount = 7;
        break;
    }

    return `
あなたは優れた批判的思考と分析能力を持つAIアシスタントです。
以下の記事を読み、${detailLevel}

記事タイトル: ${article.title}
記事内容:
${article.content}

${insightCount}個のインサイトを抽出し、各インサイトに以下の情報を含めてください：
1. インサイト内容（明確かつ簡潔に）
2. カテゴリ（main_idea, supporting_evidence, implication, counterpoint, limitation, recommendation, questionのいずれか）
3. 裏付け証拠（記事中の関連する部分や引用）
4. 確信度（0.0-1.0の範囲で、このインサイトがどれだけ記事の文脈から明確に導き出せるか）

JSON形式で回答してください。例：
[
  {
    "content": "インサイト内容をここに記述",
    "category": "main_idea",
    "evidence": "裏付け証拠をここに記述",
    "confidence": 0.95
  },
  ...
]
`;
  }

  /**
   * インサイト比較用のプロンプトを作成
   * @param userInsights ユーザーのインサイト
   * @param aiInsights AIのインサイト
   * @returns プロンプト
   */
  private createInsightComparisonPrompt(userInsights: Insight[], aiInsights: AiInsight[]): string {
    // ユーザーインサイトの文字列化
    const userInsightsStr = userInsights.map((insight, index) => 
      `${index + 1}. カテゴリ: ${insight.category}, 内容: ${insight.content}`
    ).join('\n');

    // AIインサイトの文字列化
    const aiInsightsStr = aiInsights.map((insight, index) => 
      `${index + 1}. カテゴリ: ${insight.category}, 内容: ${insight.content}, 確信度: ${insight.confidence}`
    ).join('\n');

    return `
あなたは優れた批判的思考と分析能力を持つAIアシスタントです。
ユーザーが抽出したインサイトと、AIが抽出したインサイトを比較し、それぞれの類似度を評価してください。

ユーザーのインサイト:
${userInsightsStr}

AIのインサイト:
${aiInsightsStr}

各ユーザーインサイトについて、最も類似したAIインサイトを特定し、以下の情報を含むJSONを生成してください：
1. ユーザーインサイトのインデックス
2. 最も類似したAIインサイトのインデックス（類似したものがない場合はnull）
3. マッチスコア（0.0-1.0の範囲、類似性の度合い）
4. フィードバック（ユーザーのインサイトを改善するための具体的なアドバイス）

JSON形式で回答してください。例：
[
  {
    "userInsightIndex": 0,
    "aiInsightIndex": 2,
    "matchScore": 0.85,
    "feedback": "フィードバック内容をここに記述"
  },
  ...
]
`;
  }

  /**
   * OpenAI APIを呼び出す
   * @param prompt プロンプト
   * @returns APIレスポンス
   */
  private async callOpenAiApi(prompt: string): Promise<string> {
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'あなたは優れた批判的思考と分析能力を持つAIアシスタントです。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API エラー: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    return responseData.choices[0].message.content;
  }

  /**
   * AIレスポンスからインサイトを解析
   * @param response APIレスポンス
   * @returns AIインサイトの配列
   */
  private parseAiInsights(response: string): AiInsight[] {
    try {
      // JSONの部分を抽出
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('レスポンスからJSONを抽出できませんでした');
      }
      
      const jsonStr = jsonMatch[0];
      const insightsData = JSON.parse(jsonStr);

      // インサイトの変換
      const now = new Date();
      return insightsData.map((data: any) => ({
        id: uuidv4(),
        content: data.content,
        category: this.validateCategory(data.category),
        evidence: data.evidence,
        confidence: this.validateConfidence(data.confidence),
        createdAt: now,
        updatedAt: now
      }));
    } catch (error) {
      console.error('AIレスポンスの解析エラー:', error, 'レスポンス:', response);
      return this.getMockAiInsights();
    }
  }

  /**
   * AIレスポンスから比較結果を解析
   * @param response APIレスポンス
   * @param userInsights ユーザーのインサイト
   * @param aiInsights AIのインサイト
   * @returns 比較結果の配列
   */
  private parseComparisonResults(
    response: string,
    userInsights: Insight[],
    aiInsights: AiInsight[]
  ): InsightComparison[] {
    try {
      // JSONの部分を抽出
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('レスポンスからJSONを抽出できませんでした');
      }
      
      const jsonStr = jsonMatch[0];
      const comparisonsData = JSON.parse(jsonStr);

      // 比較結果の変換
      return comparisonsData.map((data: any) => {
        const userInsight = userInsights[data.userInsightIndex] || userInsights[0];
        const aiInsight = data.aiInsightIndex !== null ? aiInsights[data.aiInsightIndex] : undefined;
        
        return {
          userInsight,
          aiInsight,
          matchScore: this.validateConfidence(data.matchScore),
          feedback: data.feedback
        };
      });
    } catch (error) {
      console.error('比較結果の解析エラー:', error, 'レスポンス:', response);
      return this.createSimpleComparisons(userInsights, aiInsights);
    }
  }

  /**
   * カテゴリの検証と修正
   * @param category カテゴリ文字列
   * @returns 有効なカテゴリ
   */
  private validateCategory(category: string): InsightCategory {
    // 小文字に変換して比較
    const lowerCategory = category.toLowerCase();
    
    // 有効なカテゴリをチェック
    for (const validCategory of Object.values(InsightCategory)) {
      if (lowerCategory.includes(validCategory)) {
        return validCategory;
      }
    }
    
    // デフォルトのカテゴリ
    return InsightCategory.MAIN_IDEA;
  }

  /**
   * 確信度の検証と修正
   * @param confidence 確信度
   * @returns 有効な確信度（0-1の範囲）
   */
  private validateConfidence(confidence: number): number {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      return 0.7; // デフォルト値
    }
    
    // 0-1の範囲に収める
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * 単純な比較を作成
   * @param userInsights ユーザーのインサイト
   * @param aiInsights AIのインサイト
   * @returns 単純な比較結果
   */
  private createSimpleComparisons(userInsights: Insight[], aiInsights: AiInsight[]): InsightComparison[] {
    return userInsights.map(userInsight => {
      // カテゴリが一致するAIインサイトを検索
      const matchingAiInsight = aiInsights.find(ai => ai.category === userInsight.category);
      
      // 簡易的な類似性スコア（カテゴリが一致すれば0.5、そうでなければ0.3）
      const matchScore = matchingAiInsight ? 0.5 : 0.3;
      
      return {
        userInsight,
        aiInsight: matchingAiInsight,
        matchScore,
        feedback: 'インサイトを深めるために、より具体的な例や証拠を追加することを検討してください。'
      };
    });
  }

  /**
   * モックのAIインサイトを取得（APIキーがない場合などに使用）
   * @returns モックのAIインサイト
   */
  private getMockAiInsights(): AiInsight[] {
    const now = new Date();
    
    return [
      {
        id: uuidv4(),
        content: '記事の主要な考えや論点を簡潔にまとめたインサイトです。',
        category: InsightCategory.MAIN_IDEA,
        evidence: '記事全体の文脈から導き出されています。',
        confidence: 0.9,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        content: '主要な考えを支持する証拠や事実です。',
        category: InsightCategory.SUPPORTING_EVIDENCE,
        evidence: '記事の特定の部分から抽出されています。',
        confidence: 0.85,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        content: '記事の内容から導き出される意味合いや影響です。',
        category: InsightCategory.IMPLICATION,
        evidence: '記事の文脈と外部の知識から導き出されています。',
        confidence: 0.7,
        createdAt: now,
        updatedAt: now
      }
    ];
  }
}

// デフォルトエクスポート
export default OpenAiService; 