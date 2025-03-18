'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { useInsights } from '@/lib/hooks/useInsights';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Insights() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { insights, loading, error, fetchAllInsights } = useInsights();

  const query = searchParams.get('query') || '';
  const filter = searchParams.get('filter') || 'all';

  // フィルタリングと検索処理
  const filteredInsights = insights.filter(insight => {
    if (!query) return true;
    
    const searchLower = query.toLowerCase();
    
    if (filter === 'all') {
      return (
        insight.content.toLowerCase().includes(searchLower) ||
        (insight.article?.title && insight.article.title.toLowerCase().includes(searchLower)) ||
        new Date(insight.createdAt).toLocaleDateString().includes(searchLower)
      );
    } else if (filter === 'content') {
      return insight.content.toLowerCase().includes(searchLower);
    } else if (filter === 'article') {
      return insight.article?.title && insight.article.title.toLowerCase().includes(searchLower);
    } else if (filter === 'date') {
      return new Date(insight.createdAt).toLocaleDateString().includes(searchLower);
    }
    
    return true;
  });

  useEffect(() => {
    if (user) {
      fetchAllInsights();
    }
  }, [user, fetchAllInsights]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">インサイト ライブラリ</h1>
        </div>
        
        <div className="mb-6">
          <SearchBar 
            placeholder="インサイトを検索..."
            searchType="insights"
            className="mb-4"
          />
          
          {query && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{filteredInsights.length}</span> 件の結果が見つかりました
                {query && <span>「{query}」</span>}
                {filter !== 'all' && <span> （フィルター: {filter}）</span>}
              </p>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 mb-4">インサイトが見つかりませんでした</p>
            <p className="text-gray-400 mb-6">
              {query ? '検索条件を変更してください' : '記事を読んでインサイトを追加してみましょう'}
            </p>
            <Button asChild>
              <Link href="/articles">記事を探す</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsights.map(insight => (
              <Card key={insight.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant={insight.isAiGenerated ? "secondary" : "default"}>
                      {insight.isAiGenerated ? 'AI生成' : 'ユーザー作成'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {insight.article && (
                    <CardDescription className="line-clamp-1">
                      <Link href={`/articles/${insight.article.id}`} className="hover:underline">
                        {insight.article.title}
                      </Link>
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 line-clamp-4">{insight.content}</p>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Link
                    href={insight.article ? `/articles/${insight.article.id}/insights/${insight.id}` : '#'}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    詳細を見る
                  </Link>
                  
                  <Link
                    href={insight.article ? `/articles/${insight.article.id}/insights/${insight.id}/edit` : '#'}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    編集
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {!loading && filteredInsights.length > 0 && filteredInsights.length > 12 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <a href="#" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-l-md">1</a>
              <a href="#" className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50">2</a>
              <a href="#" className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50">3</a>
            </nav>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 