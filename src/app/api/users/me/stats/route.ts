import { NextRequest, NextResponse } from 'next/server';
import { ArticleRepository } from '@/lib/repositories/articleRepository';
import { ArticleStatus } from '@/lib/models/article';

/**
 * ユーザー統計情報取得API
 * GET /api/users/me/stats
 */
export async function GET(req: NextRequest) {
  try {
    // ユーザーIDの取得
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }
    
    // 記事リポジトリの初期化
    const articleRepository = new ArticleRepository();
    
    // 記事データの取得
    const [
      recentArticles, 
      publishedArticleCount, 
      draftArticleCount, 
      allArticles, 
      totalInsights, 
      articleCategories, 
      insightCategories,
      recentActivity
    ] = await Promise.all([
      // 最新記事の取得（最新5件）
      articleRepository.findByUserId(userId, { limit: 5, sort: { createdAt: -1 } }),
      
      // 公開済み記事数
      articleRepository.countByUserId(userId, ArticleStatus.PUBLISHED),
      
      // 下書き記事数
      articleRepository.countByUserId(userId, ArticleStatus.DRAFT),
      
      // すべての記事（統計用）
      articleRepository.findByUserId(userId),
      
      // インサイト総数
      articleRepository.countInsightsByUserId(userId),
      
      // 記事カテゴリ別集計
      articleRepository.getArticleCategoryCountsByUserId(userId),
      
      // インサイトカテゴリ別集計
      articleRepository.getInsightCategoryCountsByUserId(userId),
      
      // 最近のアクティビティ
      articleRepository.getRecentActivityByUserId(userId, getThirtyDaysAgo())
    ]);
    
    // レスポンスデータの構築
    const stats = {
      totalArticles: publishedArticleCount + draftArticleCount,
      publishedArticles: publishedArticleCount,
      draftArticles: draftArticleCount,
      totalInsights,
      recentArticles: recentArticles.map(article => ({
        id: article._id,
        title: article.title,
        category: article.category,
        createdAt: article.createdAt,
        insightCount: article.insights ? article.insights.length : 0
      })),
      articleCategories,
      insightCategories,
      recentActivity
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('ユーザー統計情報取得エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ユーザー統計情報の取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * 30日前の日付を取得します
 */
function getThirtyDaysAgo(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
} 