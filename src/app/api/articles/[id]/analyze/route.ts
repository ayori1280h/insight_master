import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepository } from '@/lib/repositories/articleRepository';
import { AiService } from '@/lib/services/aiService';
import { AnalysisLevel } from '@/lib/models/article';

/**
 * 記事分析APIエンドポイント
 * POST /api/articles/[id]/analyze
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

    // リクエストの解析
    const body = await req.json();
    const articleId = params.id;
    const level = body.level || AnalysisLevel.BASIC;

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

    // AIサービスの初期化
    const aiService = new AiService();

    // 記事分析の実行
    const aiInsights = await aiService.analyzeArticle(article, level);

    // 分析結果を保存
    await articleRepository.saveAiInsights(articleId, userId, aiInsights);

    // レスポンス生成
    return NextResponse.json({
      message: '記事の分析が完了しました。',
      insights: aiInsights,
    });
  } catch (error) {
    console.error('記事分析エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '記事の分析中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * 記事分析状態取得API
 * GET /api/articles/[id]/analyze
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
      hasAnalysis: !!article.analyzedAt,
      analyzedAt: article.analyzedAt,
      insights: article.aiInsights || [],
    });
  } catch (error) {
    console.error('記事分析状態取得エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '分析状態の取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 