'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useArticles, ArticleInput } from '@/lib/hooks/useArticles';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const NewArticlePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { loading, error, createArticle, clearError } = useArticles();
  
  const [article, setArticle] = useState<ArticleInput>({
    title: '',
    content: '',
    source: '',
    url: '',
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [validationError, setValidationError] = useState('');

  // フォーム送信ハンドラ
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // 簡易バリデーション
    if (!article.title.trim()) {
      setValidationError('タイトルを入力してください');
      return;
    }
    
    if (!article.content.trim()) {
      setValidationError('内容を入力してください');
      return;
    }
    
    if (!article.source.trim()) {
      setValidationError('情報源を入力してください');
      return;
    }
    
    // URLのバリデーション（必須ではない）
    if (article.url && !isValidUrl(article.url)) {
      setValidationError('有効なURLを入力してください');
      return;
    }
    
    // 記事を作成
    const newArticle = await createArticle(article);
    if (newArticle) {
      router.push(`/articles/${newArticle._id}`);
    }
  };

  // 入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArticle(prev => ({
      ...prev,
      [name]: value,
    }));
    clearError();
    setValidationError('');
  };

  // タグ追加ハンドラ
  const handleAddTag = () => {
    if (tagInput.trim() && !article.tags.includes(tagInput.trim())) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // タグ削除ハンドラ
  const handleRemoveTag = (tag: string) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  // キーダウンイベントハンドラ
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // URLバリデーション
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/articles" className="text-blue-600 hover:text-blue-800">
              ← 記事一覧に戻る
            </Link>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">新規記事作成</h1>
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {validationError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    value={article.title}
                    onChange={handleInputChange}
                    placeholder="記事のタイトル"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    内容 <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="content"
                    name="content"
                    value={article.content}
                    onChange={handleInputChange}
                    placeholder="記事の内容"
                    required
                    rows={10}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                    情報源 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="source"
                    name="source"
                    type="text"
                    value={article.source}
                    onChange={handleInputChange}
                    placeholder="記事の情報源（書籍名、ウェブサイト名など）"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    URL
                  </label>
                  <Input
                    id="url"
                    name="url"
                    type="text"
                    value={article.url}
                    onChange={handleInputChange}
                    placeholder="記事のURL（任意）"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    タグ
                  </label>
                  <div className="flex">
                    <Input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="タグを入力（Enterで追加）"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddTag}
                      variant="outline"
                      className="ml-2"
                    >
                      追加
                    </Button>
                  </div>
                  
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {article.tags.map((tag, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-xs hover:text-red-500 focus:outline-none"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/articles')}
                  >
                    キャンセル
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading}
                  >
                    {loading && <LoadingSpinner className="mr-2" size="small" />}
                    保存
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NewArticlePage; 