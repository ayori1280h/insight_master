'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useArticles } from '@/lib/hooks/useArticles';
import { useInsights, InsightInput } from '@/lib/hooks/useInsights';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditInsightPageProps {
  params: {
    id: string; // 記事ID
    insightId: string; // インサイトID
  };
}

const EditInsightPage = ({ params }: EditInsightPageProps) => {
  const { id: articleId, insightId } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentArticle, loading: articleLoading, error: articleError, fetchArticleById } = useArticles();
  const { 
    loading: insightLoading, 
    error: insightError, 
    updateInsight, 
    deleteInsight,
    fetchInsightById,
    currentInsight,
    clearError 
  } = useInsights();
  
  const [insight, setInsight] = useState<InsightInput>({
    content: '',
    articleId: articleId,
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // 記事とインサイトを取得
  useEffect(() => {
    if (user && articleId && insightId) {
      fetchArticleById(articleId);
      fetchInsightById(insightId);
    }
  }, [user, articleId, insightId, fetchArticleById, fetchInsightById]);

  // インサイトデータをフォームにセット
  useEffect(() => {
    if (currentInsight) {
      setInsight({
        content: currentInsight.content,
        articleId: currentInsight.articleId,
        tags: [...currentInsight.tags],
      });
    }
  }, [currentInsight]);

  // フォーム送信ハンドラ
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // 簡易バリデーション
    if (!insight.content.trim()) {
      setValidationError('インサイトの内容を入力してください');
      return;
    }
    
    // インサイトを更新
    const updatedInsight = await updateInsight(insightId, insight);
    if (updatedInsight) {
      router.push(`/articles/${articleId}`);
    }
  };

  // 入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInsight(prev => ({
      ...prev,
      [name]: value,
    }));
    clearError();
    setValidationError('');
  };

  // タグ追加ハンドラ
  const handleAddTag = () => {
    if (tagInput.trim() && !insight.tags.includes(tagInput.trim())) {
      setInsight(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // タグ削除ハンドラ
  const handleRemoveTag = (tag: string) => {
    setInsight(prev => ({
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

  // 記事のタグをすべて追加
  const handleAddAllArticleTags = () => {
    if (currentArticle && currentArticle.tags.length > 0) {
      setInsight(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...currentArticle.tags])],
      }));
    }
  };

  // インサイト削除ハンドラ
  const handleDelete = async () => {
    if (deleteConfirm) {
      const deleted = await deleteInsight(insightId);
      if (deleted) {
        router.push(`/articles/${articleId}`);
      }
    } else {
      setDeleteConfirm(true);
    }
  };

  if (authLoading || articleLoading || (insightLoading && !currentInsight)) {
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

  if (insightError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h1 className="text-xl font-semibold text-red-800 mb-4">エラーが発生しました</h1>
            <p className="mb-4">{insightError}</p>
            <Button onClick={() => router.push(`/articles/${articleId}`)}>記事に戻る</Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!currentArticle || !currentInsight) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-md p-6 text-center">
            <h1 className="text-xl font-semibold mb-4">記事またはインサイトが見つかりません</h1>
            <Button onClick={() => router.push('/articles')}>記事一覧に戻る</Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href={`/articles/${articleId}`} className="text-blue-600 hover:text-blue-800">
              ← 記事に戻る
            </Link>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="p-6 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold">元の記事</h2>
              <h3 className="text-lg font-medium mt-2">{currentArticle.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{currentArticle.source}</p>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">インサイトを編集</h1>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  className="h-9"
                >
                  {deleteConfirm ? '削除を確認' : 'インサイトを削除'}
                </Button>
              </div>
              
              {insightError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{insightError}</AlertDescription>
                </Alert>
              )}
              
              {validationError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    インサイト内容 <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="content"
                    name="content"
                    value={insight.content}
                    onChange={handleInputChange}
                    placeholder="この記事から得た洞察や気づきを記入してください"
                    required
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      タグ
                    </label>
                    {currentArticle.tags.length > 0 && (
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddAllArticleTags}
                      >
                        記事のタグをすべて追加
                      </Button>
                    )}
                  </div>
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
                  
                  {insight.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {insight.tags.map((tag, idx) => (
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
                    onClick={() => router.push(`/articles/${articleId}`)}
                  >
                    キャンセル
                  </Button>
                  <Button 
                    type="submit"
                    disabled={insightLoading}
                  >
                    {insightLoading && <LoadingSpinner className="mr-2" size="small" />}
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

export default EditInsightPage; 