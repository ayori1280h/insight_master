import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepository } from '@/lib/repositories/articleRepository';

/**
 * インサイト更新API
 * PUT /api/articles/[id]/insights/[insightId]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; insightId: string } }
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

    const { id: articleId, insightId } = params;

    // バリデーション
    if (!articleId || !insightId) {
      return NextResponse.json(
        { error: '記事IDとインサイトIDは必須です。' },
        { status: 400 }
      );
    }

    // リクエストの解析
    const body = await req.json();

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

    // インサイトの存在確認
    const insightExists = article.insights.some(insight => insight.id === insightId);

    if (!insightExists) {
      return NextResponse.json(
        { error: 'インサイトが見つかりません。' },
        { status: 404 }
      );
    }

    // インサイトの更新
    const updatedArticle = await articleRepository.updateInsight(
      articleId,
      userId,
      insightId,
      {
        content: body.content,
        category: body.category,
        evidence: body.evidence
      }
    );

    // レスポンス生成
    return NextResponse.json({
      message: 'インサイトが更新されました。',
      article: updatedArticle
    });
  } catch (error) {
    console.error('インサイト更新エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'インサイトの更新中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * インサイト削除API
 * DELETE /api/articles/[id]/insights/[insightId]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; insightId: string } }
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

    const { id: articleId, insightId } = params;

    // バリデーション
    if (!articleId || !insightId) {
      return NextResponse.json(
        { error: '記事IDとインサイトIDは必須です。' },
        { status: 400 }
      );
    }

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

    // インサイトの存在確認
    const insightExists = article.insights.some(insight => insight.id === insightId);

    if (!insightExists) {
      return NextResponse.json(
        { error: 'インサイトが見つかりません。' },
        { status: 404 }
      );
    }

    // インサイトの削除
    const updatedArticle = await articleRepository.deleteInsight(articleId, userId, insightId);

    // レスポンス生成
    return NextResponse.json({
      message: 'インサイトが削除されました。',
      article: updatedArticle
    });
  } catch (error) {
    console.error('インサイト削除エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'インサイトの削除中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 