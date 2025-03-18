'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useArticles } from '@/lib/hooks/useArticles';
import { useInsights, type Insight } from '@/lib/hooks/useInsights';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ArticlePageProps {
  params: {
    id: string;
  };
}

const ArticlePage = ({ params }: ArticlePageProps) => {
  const { id } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentArticle, loading: articleLoading, error: articleError, fetchArticleById, deleteArticle } = useArticles();
  const { insights, loading: insightsLoading, error: insightsError, fetchInsightsByArticleId } = useInsights();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 記事とインサイトを取得
  useEffect(() => {
    if (user && id) {
      fetchArticleById(id);
      fetchInsightsByArticleId(id);
    }
  }, [user, id, fetchArticleById, fetchInsightsByArticleId]);

  // 記事削除ハンドラ
  const handleDelete = async () => {
    if (confirmDelete) {
      const success = await deleteArticle(id);
      if (success) {
        router.push('/articles');
      }
    } else {
      setConfirmDelete(true);
      // 5秒後に確認状態をリセット
      setTimeout(() => setConfirmDelete(false), 5000);
    }
  };

  if (authLoading || articleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (articleError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h1 className="text-xl font-semibold text-red-800 mb-4">エラーが発生しました</h1>
            <p className="mb-4">{articleError}</p>
            <Button onClick={() => router.push('/articles')}>記事一覧に戻る</Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!currentArticle) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-md p-6 text-center">
            <h1 className="text-xl font-semibold mb-4">記事が見つかりません</h1>
            <Button onClick={() => router.push('/articles')}>記事一覧に戻る</Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <article className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/articles" className="text-blue-600 hover:text-blue-800 mb-4 sm:mb-0">
              ← 記事一覧に戻る
            </Link>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/articles/${id}/edit`)}
              >
                編集
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                {confirmDelete ? '削除を確認' : '削除'}
              </Button>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{currentArticle.title}</h1>
              <div className="flex items-center text-gray-500 text-sm mb-6">
                <span>{currentArticle.source}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(currentArticle.createdAt)}</span>
                {currentArticle.url && (
                  <>
                    <span className="mx-2">•</span>
                    <a
                      href={currentArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      元記事を開く
                    </a>
                  </>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                {currentArticle.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {currentArticle.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">インサイト</h2>
                <Button onClick={() => router.push(`/articles/${id}/insights/new`)}>
                  新規インサイト
                </Button>
              </div>

              {insightsLoading ? (
                <div className="flex justify-center p-12">
                  <LoadingSpinner />
                </div>
              ) : insightsError ? (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                  {insightsError}
                </div>
              ) : insights.length === 0 ? (
                <div className="text-center p-12">
                  <p className="text-gray-500 mb-4">この記事に関連するインサイトはまだありません。</p>
                  <Button onClick={() => router.push(`/articles/${id}/insights/new`)}>
                    最初のインサイトを作成
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {insights.map((insight: Insight) => (
                    <InsightItem key={insight._id} insight={insight} articleId={id} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </article>
      </div>
    </ProtectedRoute>
  );
};

interface InsightItemProps {
  insight: Insight;
  articleId: string;
}

const InsightItem = ({ insight, articleId }: InsightItemProps) => {
  return (
    <li className="border-b last:border-b-0 pb-4 last:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <p className="mb-1">{insight.content}</p>
          <div className="flex flex-wrap gap-1 mb-1">
            {insight.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-500">{formatDate(insight.createdAt)}</p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/articles/${articleId}/insights/${insight._id}/edit`}>
              編集
            </Link>
          </Button>
        </div>
      </div>
    </li>
  );
};

export default ArticlePage; 