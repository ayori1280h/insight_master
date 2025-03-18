import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepository } from '@/lib/repositories/articleRepository';
import { CreateInsightRequest } from '@/lib/models/article';

/**
 * インサイト追加API
 * POST /api/articles/[id]/insights
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

    // リクエストの解析
    const body = await req.json();

    // 必須フィールドのチェック
    if (!body.content) {
      return NextResponse.json(
        { error: 'インサイト内容は必須です。' },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { error: 'カテゴリは必須です。' },
        { status: 400 }
      );
    }

    const insightData: CreateInsightRequest = {
      content: body.content,
      category: body.category,
      evidence: body.evidence,
    };

    // リポジトリの初期化
    const articleRepository = new ArticleRepository();

    // 記事の存在確認
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

    // インサイトの追加
    const updatedArticle = await articleRepository.addInsight(articleId, userId, insightData);

    // レスポンス生成
    return NextResponse.json({
      message: 'インサイトが追加されました。',
      article: updatedArticle
    });
  } catch (error) {
    console.error('インサイト追加エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'インサイトの追加中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * インサイト一覧取得API
 * GET /api/articles/[id]/insights
 */
export async function GET(
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

    // レスポンス生成
    return NextResponse.json({
      insights: article.insights || [],
      aiInsights: article.aiInsights || []
    });
  } catch (error) {
    console.error('インサイト一覧取得エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'インサイトの取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 