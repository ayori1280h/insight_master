import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepository } from '@/lib/repositories/articleRepository';
import { ArticleStatus, CreateArticleRequest } from '@/lib/models/article';

/**
 * 記事作成API
 * POST /api/articles
 */
export async function POST(req: NextRequest) {
  try {
    // ユーザーIDの取得（認証ミドルウェアから）
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // リクエストの解析
    const body = await req.json();

    // バリデーション
    if (!body.title) {
      return NextResponse.json(
        { error: 'タイトルは必須です。' },
        { status: 400 }
      );
    }

    if (!body.content) {
      return NextResponse.json(
        { error: '内容は必須です。' },
        { status: 400 }
      );
    }

    // 記事データの作成
    const articleData: CreateArticleRequest = {
      title: body.title,
      content: body.content,
      url: body.url,
      author: body.author,
      source: body.source,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      imageUrl: body.imageUrl,
      status: body.status || ArticleStatus.DRAFT,
      tags: body.tags || [],
    };

    // リポジトリの初期化
    const articleRepository = new ArticleRepository();

    // 記事の作成
    const article = await articleRepository.create(userId, articleData);

    // レスポンス生成
    return NextResponse.json({
      message: '記事が作成されました。',
      article
    });
  } catch (error) {
    console.error('記事作成エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '記事の作成中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * 記事一覧取得API
 * GET /api/articles
 */
export async function GET(req: NextRequest) {
  try {
    // ユーザーIDの取得（認証ミドルウェアから）
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // クエリパラメータの解析
    const url = new URL(req.url);
    const status = url.searchParams.get('status') as ArticleStatus | null;
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = parseInt(url.searchParams.get('skip') || '0', 10);
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');

    // リポジトリの初期化
    const articleRepository = new ArticleRepository();

    // 記事の取得
    let articles;
    
    if (tag) {
      // タグでフィルタリング
      articles = await articleRepository.findByTag(userId, tag, limit, skip);
    } else if (search) {
      // 検索クエリでフィルタリング
      articles = await articleRepository.search(userId, search, limit, skip);
    } else {
      // 通常の記事リスト
      articles = await articleRepository.findByUserId(userId, status, limit, skip);
    }

    // 総件数の取得
    const total = await articleRepository.countByUserId(userId, status);

    // レスポンス生成
    return NextResponse.json({
      articles,
      total,
      limit,
      skip
    });
  } catch (error) {
    console.error('記事一覧取得エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '記事の取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 