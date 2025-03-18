import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/utils';

// 記事の型定義
export interface Article {
  _id: string;
  title: string;
  content: string;
  source: string;
  url?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// 記事作成・更新のための型定義
export interface ArticleInput {
  title: string;
  content: string;
  source: string;
  url?: string;
  tags: string[];
}

// 記事フィルタリングのためのオプション
export interface ArticleFilterOptions {
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortDirection?: 'asc' | 'desc';
}

/**
 * 記事管理用カスタムフック
 */
export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 記事一覧を取得
   */
  const fetchArticles = useCallback(async (options?: ArticleFilterOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      // クエリパラメータの構築
      const queryParams = new URLSearchParams();
      if (options?.search) queryParams.append('search', options.search);
      if (options?.tags?.length) queryParams.append('tags', options.tags.join(','));
      if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options?.sortDirection) queryParams.append('sortDirection', options.sortDirection);
      
      const url = `/api/articles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await fetchWithAuth<{ articles: Article[] }>(url);
      
      setArticles(data.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の取得中にエラーが発生しました');
      console.error('記事取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 記事詳細を取得
   */
  const fetchArticleById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ article: Article }>(`/api/articles/${id}`);
      setCurrentArticle(data.article);
      return data.article;
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の取得中にエラーが発生しました');
      console.error('記事詳細取得エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 新規記事を作成
   */
  const createArticle = useCallback(async (articleData: ArticleInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ article: Article }>('/api/articles', {
        method: 'POST',
        body: JSON.stringify(articleData),
      });
      
      setArticles(prev => [data.article, ...prev]);
      return data.article;
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の作成中にエラーが発生しました');
      console.error('記事作成エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 記事を更新
   */
  const updateArticle = useCallback(async (id: string, articleData: ArticleInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ article: Article }>(`/api/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(articleData),
      });
      
      // 記事リストと現在の記事を更新
      setArticles(prev => prev.map(article => 
        article._id === id ? data.article : article
      ));
      
      if (currentArticle?._id === id) {
        setCurrentArticle(data.article);
      }
      
      return data.article;
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の更新中にエラーが発生しました');
      console.error('記事更新エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentArticle]);

  /**
   * 記事を削除
   */
  const deleteArticle = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchWithAuth(`/api/articles/${id}`, {
        method: 'DELETE',
      });
      
      // 記事リストから削除
      setArticles(prev => prev.filter(article => article._id !== id));
      
      // 現在の記事が削除対象だった場合はnullに設定
      if (currentArticle?._id === id) {
        setCurrentArticle(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の削除中にエラーが発生しました');
      console.error('記事削除エラー:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentArticle]);

  /**
   * エラー状態をクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    articles,
    currentArticle,
    loading,
    error,
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    clearError,
  };
} 