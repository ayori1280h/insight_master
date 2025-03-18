import { Article } from '../models/article';
import { InsightPoint, InsightCategory, InsightAnalysis, AnalysisLevel } from '../models/insight';

/**
 * 洞察分析システムクラス
 * 記事を分析し、洞察ポイントを抽出するための機能を提供します
 */
export class InsightAnalyzer {
  /**
   * 記事を分析し、洞察ポイントを抽出する
   * @param article 分析対象の記事
   * @param level 分析レベル
   * @returns 洞察分析結果
   */
  static analyzeArticle(article: Article, level: AnalysisLevel = AnalysisLevel.BEGINNER): InsightAnalysis {
    // 実際の実装では、AIを使用して記事を分析します
    // このサンプル実装では、モックデータを返します
    
    // 記事の内容に基づいて洞察ポイントを生成
    const insights: InsightPoint[] = this.generateMockInsights(article, level);
    
    // 分析結果を作成
    const analysis: InsightAnalysis = {
      id: `analysis-${Date.now()}`,
      articleId: article.id,
      insights,
      summary: this.generateAnalysisSummary(article, insights),
      analysisLevel: level,
      createdAt: new Date()
    };
    
    return analysis;
  }
  
  /**
   * モックの洞察ポイントを生成する
   * @param article 分析対象の記事
   * @param level 分析レベル
   * @returns 洞察ポイントの配列
   */
  private static generateMockInsights(article: Article, level: AnalysisLevel): InsightPoint[] {
    const insights: InsightPoint[] = [];
    
    // 記事のカテゴリーに基づいて、関連する洞察ポイントを生成
    switch (article.category) {
      case 'テクノロジー':
        insights.push(
          this.createInsightPoint(
            article.id,
            InsightCategory.HIDDEN_ASSUMPTION,
            '技術的実現可能性の前提',
            '記事は技術の進歩が現在のペースで継続することを前提としていますが、技術的障壁や規制の変化によってこのペースが変わる可能性があります。',
            4
          ),
          this.createInsightPoint(
            article.id,
            InsightCategory.INDUSTRY_TREND,
            '競合技術の動向',
            '記事で紹介されている技術以外にも、同じ問題を解決するための競合技術が存在する可能性があります。業界全体の動向を考慮する必要があります。',
            3
          )
        );
        break;
        
      case '環境':
        insights.push(
          this.createInsightPoint(
            article.id,
            InsightCategory.AUTHOR_BIAS,
            '環境保護寄りの視点',
            '著者は環境保護の観点から議論を展開しており、経済的影響や実現可能性についての懸念が十分に考慮されていない可能性があります。',
            4
          ),
          this.createInsightPoint(
            article.id,
            InsightCategory.DATA_INTERPRETATION,
            '統計データの選択的使用',
            '記事で引用されているデータは特定の主張を支持するために選択的に使用されている可能性があります。より包括的なデータセットを考慮する必要があります。',
            5
          )
        );
        break;
        
      case '経済':
        insights.push(
          this.createInsightPoint(
            article.id,
            InsightCategory.CAUSALITY,
            '相関と因果の混同',
            '記事では特定の経済指標の変化と政策の関係について因果関係を示唆していますが、これは相関関係である可能性があります。他の要因の影響も考慮すべきです。',
            5
          ),
          this.createInsightPoint(
            article.id,
            InsightCategory.CONTRADICTION,
            '短期的影響と長期的影響の矛盾',
            '記事は短期的な経済効果を強調していますが、長期的な影響については異なる結論になる可能性があります。この潜在的な矛盾に注意すべきです。',
            4
          )
        );
        break;
        
      default:
        // デフォルトの洞察ポイント
        insights.push(
          this.createInsightPoint(
            article.id,
            InsightCategory.HIDDEN_ASSUMPTION,
            '一般的な前提条件',
            '記事には明示されていない前提条件があります。これらの前提が変わると、結論も変わる可能性があります。',
            3
          ),
          this.createInsightPoint(
            article.id,
            InsightCategory.AUTHOR_BIAS,
            '著者の視点',
            '著者の背景や専門分野が記事の内容や結論に影響を与えている可能性があります。',
            3
          )
        );
    }
    
    // 分析レベルに応じて洞察ポイントを追加
    if (level === AnalysisLevel.INTERMEDIATE || level === AnalysisLevel.ADVANCED) {
      insights.push(
        this.createInsightPoint(
          article.id,
          InsightCategory.DATA_INTERPRETATION,
          'データソースの信頼性',
          '記事で引用されているデータソースの信頼性や方法論について検討する必要があります。',
          4
        )
      );
    }
    
    if (level === AnalysisLevel.ADVANCED) {
      insights.push(
        this.createInsightPoint(
          article.id,
          InsightCategory.INDUSTRY_TREND,
          '歴史的文脈での位置づけ',
          '現在の状況を歴史的な業界の発展パターンの中で位置づけることで、将来の展開についての洞察が得られます。',
          5
        )
      );
    }
    
    return insights;
  }
  
  /**
   * 洞察ポイントを作成する
   * @param articleId 記事ID
   * @param category カテゴリー
   * @param title タイトル
   * @param description 説明
   * @param importance 重要度
   * @returns 洞察ポイント
   */
  private static createInsightPoint(
    articleId: string,
    category: InsightCategory,
    title: string,
    description: string,
    importance: number
  ): InsightPoint {
    return {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      articleId,
      category,
      title,
      description,
      importance,
      createdAt: new Date()
    };
  }
  
  /**
   * 分析結果のサマリーを生成する
   * @param article 分析対象の記事
   * @param insights 洞察ポイント
   * @returns 分析結果のサマリー
   */
  private static generateAnalysisSummary(article: Article, insights: InsightPoint[]): string {
    // 実際の実装では、AIを使用してサマリーを生成します
    // このサンプル実装では、簡易的なサマリーを生成します
    
    const categoryCount = insights.reduce((acc, insight) => {
      acc[insight.category] = (acc[insight.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryCountText = Object.entries(categoryCount)
      .map(([category, count]) => `${category}(${count})`)
      .join('、');
    
    return `この記事「${article.title}」の分析では、${insights.length}個の洞察ポイントが特定されました。主な洞察カテゴリーは${categoryCountText}です。これらのポイントを理解することで、記事の内容をより批判的に評価し、隠れた前提や著者のバイアスを認識することができます。`;
  }
  
  /**
   * ユーザーの洞察とAIの洞察を比較する
   * @param userInsights ユーザーの洞察
   * @param aiInsights AIの洞察
   * @returns マッチスコア（0-100）
   */
  static compareInsights(userInsights: string[], aiInsights: InsightPoint[]): number {
    // 実際の実装では、AIを使用して洞察を比較します
    // このサンプル実装では、簡易的な比較を行います
    
    // ユーザーの洞察がない場合は0点
    if (userInsights.length === 0) return 0;
    
    // AIの洞察がない場合は0点
    if (aiInsights.length === 0) return 0;
    
    // 単純なキーワードマッチングによる比較
    let matchCount = 0;
    
    for (const userInsight of userInsights) {
      const userKeywords = this.extractKeywords(userInsight.toLowerCase());
      
      for (const aiInsight of aiInsights) {
        const aiKeywords = this.extractKeywords(
          (aiInsight.title + ' ' + aiInsight.description).toLowerCase()
        );
        
        // キーワードの一致度を計算
        const matchingKeywords = userKeywords.filter(keyword => 
          aiKeywords.some(aiKeyword => aiKeyword.includes(keyword) || keyword.includes(aiKeyword))
        );
        
        if (matchingKeywords.length > 0) {
          matchCount += matchingKeywords.length / Math.max(userKeywords.length, aiKeywords.length);
        }
      }
    }
    
    // マッチスコアを計算（0-100）
    const maxPossibleMatches = Math.min(userInsights.length, aiInsights.length);
    const score = (matchCount / maxPossibleMatches) * 100;
    
    return Math.min(100, Math.round(score));
  }
  
  /**
   * テキストからキーワードを抽出する
   * @param text テキスト
   * @returns キーワードの配列
   */
  private static extractKeywords(text: string): string[] {
    // 実際の実装では、AIを使用してキーワードを抽出します
    // このサンプル実装では、簡易的な抽出を行います
    
    // ストップワード（除外する一般的な単語）
    const stopWords = ['の', 'に', 'は', 'を', 'が', 'と', 'で', 'た', 'し', 'て', 'です', 'ます', 'ない', 'ある'];
    
    // 単語に分割し、ストップワードを除外
    const words = text.split(/\s+|、|。/)
      .filter(word => word.length > 1 && !stopWords.includes(word));
    
    return words;
  }
}
