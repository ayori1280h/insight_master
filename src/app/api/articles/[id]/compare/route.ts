import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepository } from '@/lib/repositories/articleRepository';
import OpenAiService from '@/lib/services/aiService';

/**
 * インサイト比較API
 * POST /api/articles/[id]/compare
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ユーザーIDの取得（認証ミドルウェアから）
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    const articleId = params.id;

    // バリデーション
    if (!articleId) {
      return NextResponse.json(
        { error: '記事IDは必須です。' },
        { status: 400 }
      );
    }

    // リポジトリの初期化
    const articleRepository = new ArticleRepository();

    // 記事の取得
    const article = await articleRepository.findById(articleId);

    if (!article) {
      return NextResponse.json(
        { error: '記事が見つかりません。' },
        { status: 404 }
      );
    }

    // 権限チェック
    if (article.userId !== userId) {
      return NextResponse.json(
        { error: 'この記事にアクセスする権限がありません。' },
        { status: 403 }
      );
    }

    // AIインサイトが存在するか確認
    if (!article.aiInsights || article.aiInsights.length === 0) {
      return NextResponse.json(
        { error: 'この記事にはAIが生成したインサイトがありません。先に分析を実行してください。' },
        { status: 400 }
      );
    }

    // ユーザーインサイトが存在するか確認
    if (!article.insights || article.insights.length === 0) {
      return NextResponse.json(
        { error: 'この記事にはユーザーが追加したインサイトがありません。先にインサイトを追加してください。' },
        { status: 400 }
      );
    }

    // AIサービスの初期化
    const aiService = new OpenAiService();

    // インサイトの比較
    const comparisons = await aiService.compareInsights(article.insights, article.aiInsights);

    // レスポンス生成
    return NextResponse.json({
      message: 'インサイトの比較が完了しました。',
      comparisons
    });
  } catch (error) {
    console.error('インサイト比較エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'インサイトの比較中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 