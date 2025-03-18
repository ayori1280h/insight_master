'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useArticles } from '@/lib/hooks/useArticles';
import { useInsights } from '@/lib/hooks/useInsights';
import { useUser } from '@/lib/hooks/useUser';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ActivityGraph from '@/components/ActivityGraph';
import InsightCategoryChart from '@/components/InsightCategoryChart';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

// アクティビティデータの型定義
interface ActivityData {
  date: string;
  articles: number;
  insights: number;
}

// カテゴリデータの型定義
interface CategoryData {
  name: string;
  count: number;
  color: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { articles, loading: articlesLoading, fetchArticles } = useArticles();
  const { insights, loading: insightsLoading, fetchAllInsights } = useInsights();
  const { statistics, loading: statsLoading, fetchUserStatistics } = useUser();
  
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  // データの読み込み
  useEffect(() => {
    if (user) {
      fetchArticles();
      fetchAllInsights();
      fetchUserStatistics();
    }
  }, [user, fetchArticles, fetchAllInsights, fetchUserStatistics]);

  // アクティビティデータの生成
  useEffect(() => {
    if (!articlesLoading && !insightsLoading && articles.length > 0) {
      // 過去30日間のデータを生成
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 29);
      
      const result: ActivityData[] = [];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // その日に作成された記事とインサイトをカウント
        const articlesCount = articles.filter(a => 
          new Date(a.createdAt).toISOString().split('T')[0] === dateStr
        ).length;
        
        const insightsCount = insights.filter(i => 
          new Date(i.createdAt).toISOString().split('T')[0] === dateStr
        ).length;
        
        result.push({
          date: dateStr,
          articles: articlesCount,
          insights: insightsCount
        });
      }
      
      setActivityData(result);
    }
  }, [articles, insights, articlesLoading, insightsLoading]);

  // カテゴリデータの生成
  useEffect(() => {
    if (!insightsLoading && insights.length > 0) {
      // タグベースでカテゴリを集計
      const tagCounts: Record<string, number> = {};
      
      insights.forEach(insight => {
        if (insight.tags && insight.tags.length > 0) {
          insight.tags.forEach(tag => {
            if (tagCounts[tag]) {
              tagCounts[tag]++;
            } else {
              tagCounts[tag] = 1;
            }
          });
        } else {
          // タグなしの場合は「未分類」にカウント
          if (tagCounts['未分類']) {
            tagCounts['未分類']++;
          } else {
            tagCounts['未分類'] = 1;
          }
        }
      });
      
      // 色の配列
      const colors = ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#F43F5E', '#6B7280'];
      
      // 上位8カテゴリを抽出
      const topCategories = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count], index) => ({
          name,
          count,
          color: colors[index % colors.length]
        }));
      
      // 残りは「その他」にまとめる
      const otherCategories = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(8);
      
      const otherCount = otherCategories.reduce((sum, [_, count]) => sum + count, 0);
      
      if (otherCount > 0) {
        topCategories.push({
          name: 'その他',
          count: otherCount,
          color: '#6B7280'
        });
      }
      
      setCategoryData(topCategories);
    }
  }, [insights, insightsLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const loading = articlesLoading || insightsLoading || statsLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* 統計情報 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-500">記事</h3>
                      <span className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-semibold">
                        {loading ? (
                          <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse"></span>
                        ) : (
                          statistics?.articleCount || 0
                        )}
                      </span>
                      <Link href="/articles" className="ml-auto text-sm text-blue-600 hover:underline">
                        一覧を見る
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-500">インサイト</h3>
                      <span className="p-2 bg-purple-100 text-purple-600 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-semibold">
                        {loading ? (
                          <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse"></span>
                        ) : (
                          statistics?.insightCount || 0
                        )}
                      </span>
                      <Link href="/insights" className="ml-auto text-sm text-blue-600 hover:underline">
                        一覧を見る
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-500">AI生成インサイト</h3>
                      <span className="p-2 bg-green-100 text-green-600 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-semibold">
                        {loading ? (
                          <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse"></span>
                        ) : (
                          statistics?.aiGeneratedCount || 0
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-500">合計タグ数</h3>
                      <span className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-semibold">
                        {loading ? (
                          <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse"></span>
                        ) : (
                          statistics?.uniqueTagCount || 0
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* グラフ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ActivityGraph 
                  data={activityData} 
                  loading={loading} 
                />
                
                <InsightCategoryChart 
                  data={categoryData}
                  loading={loading}
                />
              </div>
              
              {/* 最近のアクティビティと使い方ガイド */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">ようこそ、{user?.name}さん！</h2>
                    <p className="text-gray-600 mb-6">
                      インサイトマスターでは、記事からの学びを管理し、AIを活用して分析することができます。
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-2">記事の管理</h3>
                        <p className="text-sm text-gray-600">
                          読んだ記事や書籍の情報を登録して管理できます。
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-2">インサイトの記録</h3>
                        <p className="text-sm text-gray-600">
                          記事から得た気づきやインサイトを保存できます。
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-2">AI分析</h3>
                        <p className="text-sm text-gray-600">
                          AIを使ってインサイトを分析し、新たな気づきを得られます。
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">クイックアクセス</h2>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/articles/new" className="flex items-center text-blue-600 hover:text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          新しい記事を追加
                        </Link>
                      </li>
                      <li>
                        <Link href="/insights" className="flex items-center text-blue-600 hover:text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          インサイト一覧を見る
                        </Link>
                      </li>
                      <li>
                        <Link href="/profile" className="flex items-center text-blue-600 hover:text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          プロフィール設定
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings" className="flex items-center text-blue-600 hover:text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          アプリ設定
                        </Link>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
