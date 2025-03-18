import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepository } from '@/lib/repositories/articleRepository';
import { UpdateArticleRequest } from '@/lib/models/article';

/**
 * 記事詳細取得API
 * GET /api/articles/[id]
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
    return NextResponse.json(article);
  } catch (error) {
    console.error('記事詳細取得エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '記事の取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * 記事更新API
 * PUT /api/articles/[id]
 */
export async function PUT(
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

    // 記事データの作成
    const articleData: UpdateArticleRequest = {};
    
    if (body.title !== undefined) articleData.title = body.title;
    if (body.content !== undefined) articleData.content = body.content;
    if (body.url !== undefined) articleData.url = body.url;
    if (body.author !== undefined) articleData.author = body.author;
    if (body.source !== undefined) articleData.source = body.source;
    if (body.publishedAt !== undefined) {
      articleData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : undefined;
    }
    if (body.imageUrl !== undefined) articleData.imageUrl = body.imageUrl;
    if (body.status !== undefined) articleData.status = body.status;
    if (body.tags !== undefined) articleData.tags = body.tags;

    // リポジトリの初期化
    const articleRepository = new ArticleRepository();

    // 記事の更新
    const article = await articleRepository.update(articleId, userId, articleData);

    if (!article) {
      return NextResponse.json(
        { error: '記事が見つかりません。' },
        { status: 404 }
      );
    }

    // レスポンス生成
    return NextResponse.json({
      message: '記事が更新されました。',
      article
    });
  } catch (error) {
    console.error('記事更新エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '記事の更新中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * 記事削除API
 * DELETE /api/articles/[id]
 */
export async function DELETE(
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

    // 記事の削除
    const result = await articleRepository.delete(articleId, userId);

    if (!result) {
      return NextResponse.json(
        { error: '記事が見つからないか、削除する権限がありません。' },
        { status: 404 }
      );
    }

    // レスポンス生成
    return NextResponse.json({
      message: '記事が削除されました。'
    });
  } catch (error) {
    console.error('記事削除エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '記事の削除中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 