import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { articleModel } from '@/models/article';
import { auth } from '@/middlewares/auth';
import { OpenAI } from 'openai';
import { z } from 'zod';

// リクエストバリデーションスキーマ
const generateInsightsSchema = z.object({
  articleId: z.string().min(1, 'Article ID is required'),
  prompt: z.string().optional(),
});

// レスポンスの型
export type GeneratedInsight = {
  content: string;
  tags: string[];
};

/**
 * AIによるインサイト生成API
 */
export async function POST(request: Request) {
  try {
    // 認証チェック
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // リクエストデータを取得
    const data = await request.json();
    
    // バリデーション
    const result = generateInsightsSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { articleId, prompt } = result.data;
    
    // データベース接続
    await connectDB();
    
    // 記事の存在確認とアクセス権チェック
    const article = await articleModel.findOne({
      _id: articleId,
      userId: user._id,
    });
    
    if (!article) {
      return NextResponse.json(
        { message: 'Article not found or access denied' },
        { status: 404 }
      );
    }
    
    // OpenAIクライアントの初期化
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // プロンプトのカスタマイズ
    let systemPrompt = `
      あなたは記事から重要なインサイト（洞察）を抽出する専門家です。
      以下の記事を分析し、3つの重要なインサイトを抽出してください。
      各インサイトには関連するタグも提案してください。
      
      回答は以下のJSON形式で返してください：
      [
        {
          "content": "インサイトの内容をここに記述...",
          "tags": ["タグ1", "タグ2", "タグ3"]
        },
        ...
      ]
    `;
    
    // ユーザーがプロンプトを指定した場合は追加
    if (prompt) {
      systemPrompt += `\n\n特に以下の観点を考慮してください：${prompt}`;
    }
    
    // 記事の情報を準備
    const articleInfo = `
      タイトル: ${article.title}
      ソース: ${article.source}
      タグ: ${article.tags.join(', ')}
      内容:
      ${article.content}
    `;
    
    // OpenAIへリクエスト
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: articleInfo }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });
    
    // レスポンスからインサイトを抽出
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No response from AI');
    }
    
    try {
      // JSONをパース
      const parsedResponse = JSON.parse(responseContent);
      const insights = parsedResponse.insights || [];
      
      return NextResponse.json({ insights });
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('Raw response:', responseContent);
      
      return NextResponse.json(
        { message: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { message: 'Failed to generate insights' },
      { status: 500 }
    );
  }
} 