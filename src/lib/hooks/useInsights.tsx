import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/utils';

// インサイトの型定義
export interface Insight {
  _id: string;
  content: string;
  articleId: string;
  article?: {
    id: string;
    title: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  isAiGenerated?: boolean;
}

// インサイト作成・更新のための型定義
export interface InsightInput {
  content: string;
  articleId: string;
  tags: string[];
}

// インサイトフィルタリングのためのオプション
export interface InsightFilterOptions {
  articleId?: string;
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

// AIによって生成されたインサイトの型定義
export interface GeneratedInsight {
  content: string;
  tags: string[];
}

/**
 * インサイト管理用カスタムフック
 */
export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentInsight, setCurrentInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * インサイト一覧を取得
   */
  const fetchInsights = useCallback(async (options?: InsightFilterOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      // クエリパラメータの構築
      const queryParams = new URLSearchParams();
      if (options?.articleId) queryParams.append('articleId', options.articleId);
      if (options?.search) queryParams.append('search', options.search);
      if (options?.tags?.length) queryParams.append('tags', options.tags.join(','));
      if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options?.sortDirection) queryParams.append('sortDirection', options.sortDirection);
      
      const url = `/api/insights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await fetchWithAuth<{ insights: Insight[] }>(url);
      
      setInsights(data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インサイトの取得中にエラーが発生しました');
      console.error('インサイト取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 記事に関連するインサイト一覧を取得
   */
  const fetchInsightsByArticleId = useCallback(async (articleId: string) => {
    return fetchInsights({ articleId });
  }, [fetchInsights]);

  /**
   * インサイト詳細を取得
   */
  const fetchInsightById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ insight: Insight }>(`/api/insights/${id}`);
      setCurrentInsight(data.insight);
      return data.insight;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インサイトの取得中にエラーが発生しました');
      console.error('インサイト詳細取得エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 新規インサイトを作成
   */
  const createInsight = useCallback(async (insightData: InsightInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ insight: Insight }>('/api/insights', {
        method: 'POST',
        body: JSON.stringify(insightData),
      });
      
      setInsights(prev => [data.insight, ...prev]);
      return data.insight;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インサイトの作成中にエラーが発生しました');
      console.error('インサイト作成エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * インサイトを更新
   */
  const updateInsight = useCallback(async (id: string, insightData: Partial<InsightInput>) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ insight: Insight }>(`/api/insights/${id}`, {
        method: 'PUT',
        body: JSON.stringify(insightData),
      });
      
      // インサイトリストと現在のインサイトを更新
      setInsights(prev => prev.map(insight => 
        insight._id === id ? data.insight : insight
      ));
      
      if (currentInsight?._id === id) {
        setCurrentInsight(data.insight);
      }
      
      return data.insight;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インサイトの更新中にエラーが発生しました');
      console.error('インサイト更新エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentInsight]);

  /**
   * インサイトを削除
   */
  const deleteInsight = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchWithAuth(`/api/insights/${id}`, {
        method: 'DELETE',
      });
      
      // インサイトリストから削除
      setInsights(prev => prev.filter(insight => insight._id !== id));
      
      // 現在のインサイトが削除対象だった場合はnullに設定
      if (currentInsight?._id === id) {
        setCurrentInsight(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インサイトの削除中にエラーが発生しました');
      console.error('インサイト削除エラー:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentInsight]);

  /**
   * AIによるインサイト生成
   */
  const generateInsights = useCallback(async (articleId: string, prompt?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ insights: GeneratedInsight[] }>('/api/ai/generate-insights', {
        method: 'POST',
        body: JSON.stringify({ 
          articleId,
          prompt: prompt || undefined
        }),
      });
      
      return data.insights;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インサイトの生成中にエラーが発生しました');
      console.error('インサイト生成エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * エラー状態をクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 全てのインサイトを取得
   */
  const fetchAllInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // この関数では記事情報も含めて取得する
      const data = await fetchWithAuth<{ insights: Insight[] }>('/api/insights?includeArticles=true');
      
      setInsights(data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : '全インサイトの取得中にエラーが発生しました');
      console.error('全インサイト取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    insights,
    currentInsight,
    loading,
    error,
    fetchInsights,
    fetchInsightsByArticleId,
    fetchInsightById,
    fetchAllInsights,
    createInsight,
    updateInsight,
    deleteInsight,
    generateInsights,
    clearError,
  };
} 