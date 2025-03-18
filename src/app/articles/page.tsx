'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { useArticles } from '@/lib/hooks/useArticles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Articles() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { articles, loading, error, fetchArticles } = useArticles();

  const query = searchParams.get('query') || '';
  const filter = searchParams.get('filter') || 'all';

  // フィルタリングと検索処理
  const filteredArticles = articles.filter(article => {
    if (!query) return true;
    
    const searchLower = query.toLowerCase();
    
    if (filter === 'all') {
      return (
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.source.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } else if (filter === 'title') {
      return article.title.toLowerCase().includes(searchLower);
    } else if (filter === 'content') {
      return article.content.toLowerCase().includes(searchLower);
    } else if (filter === 'source') {
      return article.source.toLowerCase().includes(searchLower);
    } else if (filter === 'tags') {
      return article.tags.some(tag => tag.toLowerCase().includes(searchLower));
    }
    
    return true;
  });

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user, fetchArticles]);

  const handleCreateArticle = () => {
    router.push('/articles/new');
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">記事ライブラリ</h1>
          <Button onClick={handleCreateArticle}>
            記事を追加
          </Button>
        </div>
        
        <div className="mb-6">
          <SearchBar 
            placeholder="記事を検索..."
            searchType="articles"
            className="mb-4"
          />
          
          {query && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{filteredArticles.length}</span> 件の結果が見つかりました
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
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 mb-4">記事が見つかりませんでした</p>
            <p className="text-gray-400 mb-6">
              {query ? '検索条件を変更するか、新しい記事を追加してください' : '新しい記事を追加してみましょう'}
            </p>
            <Button onClick={handleCreateArticle}>
              記事を追加
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {article.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">{article.title}</h2>
                  <p className="mt-2 text-gray-600 text-sm line-clamp-3">
                    {article.content}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <Link href={`/articles/${article.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      詳細を見る →
                    </Link>
                    <div className="text-gray-500 text-sm">
                      {article.insights?.length || 0} インサイト
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* ページネーション（必要に応じて実装） */}
        {!loading && filteredArticles.length > 0 && (
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
