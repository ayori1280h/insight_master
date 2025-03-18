'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useArticles } from '@/lib/hooks/useArticles';
import { useInsights, InsightInput } from '@/lib/hooks/useInsights';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIInsightPageProps {
  params: {
    id: string; // 記事ID
  };
}

type InsightSuggestion = {
  content: string;
  tags: string[];
  selected: boolean;
};

const AIInsightPage = ({ params }: AIInsightPageProps) => {
  const { id: articleId } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentArticle, loading: articleLoading, error: articleError, fetchArticleById } = useArticles();
  const { 
    loading: insightLoading, 
    error: insightError, 
    createInsight,
    generateInsights,
    clearError 
  } = useInsights();
  
  const [generatedInsights, setGeneratedInsights] = useState<InsightSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [customInsight, setCustomInsight] = useState<InsightInput>({
    content: '',
    articleId: articleId,
    tags: [],
  });
  const [activeTab, setActiveTab] = useState('generated');
  const [validationError, setValidationError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 記事を取得
  useEffect(() => {
    if (user && articleId) {
      fetchArticleById(articleId);
    }
  }, [user, articleId, fetchArticleById]);

  // 生成されたインサイトの選択を切り替える
  const toggleInsightSelection = (index: number) => {
    setGeneratedInsights(prevInsights => 
      prevInsights.map((insight, i) => 
        i === index ? { ...insight, selected: !insight.selected } : insight
      )
    );
  };

  // AIインサイト生成ハンドラ
  const handleGenerateInsights = async () => {
    if (!currentArticle) return;
    
    setIsGenerating(true);
    clearError();
    
    try {
      const insights = await generateInsights(articleId, prompt);
      if (insights && insights.length > 0) {
        setGeneratedInsights(
          insights.map(insight => ({
            content: insight.content,
            tags: insight.tags || [],
            selected: false
          }))
        );
        setActiveTab('generated');
      }
    } catch (err) {
      console.error('インサイト生成エラー:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 選択したインサイトを保存
  const handleSaveSelectedInsights = async () => {
    const selectedInsights = generatedInsights.filter(insight => insight.selected);
    
    if (selectedInsights.length === 0) {
      setValidationError('少なくとも1つのインサイトを選択してください');
      return;
    }
    
    setValidationError('');
    setSaveSuccess(false);
    
    try {
      let savedCount = 0;
      
      for (const insight of selectedInsights) {
        const result = await createInsight({
          content: insight.content,
          articleId: articleId,
          tags: insight.tags
        });
        
        if (result) savedCount++;
      }
      
      if (savedCount > 0) {
        setSaveSuccess(true);
        
        // 選択を解除
        setGeneratedInsights(prevInsights => 
          prevInsights.map(insight => ({ ...insight, selected: false }))
        );
        
        // 少し待ってから成功メッセージをクリア
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('インサイト保存エラー:', err);
    }
  };

  // カスタムインサイトを保存
  const handleSaveCustomInsight = async () => {
    setValidationError('');
    
    if (!customInsight.content.trim()) {
      setValidationError('インサイトの内容を入力してください');
      return;
    }
    
    try {
      const result = await createInsight({
        content: customInsight.content,
        articleId: articleId,
        tags: customInsight.tags
      });
      
      if (result) {
        // フォームをリセット
        setCustomInsight({
          content: '',
          articleId: articleId,
          tags: []
        });
        setSaveSuccess(true);
        
        // 少し待ってから成功メッセージをクリア
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('カスタムインサイト保存エラー:', err);
    }
  };

  // カスタムインサイトの入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomInsight(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
    setValidationError('');
  };

  // タグ追加ハンドラ
  const handleAddTag = () => {
    if (tagInput.trim() && !customInsight.tags.includes(tagInput.trim())) {
      setCustomInsight(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // タグ削除ハンドラ
  const handleRemoveTag = (tag: string) => {
    setCustomInsight(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
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
      setCustomInsight(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...currentArticle.tags])]
      }));
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
              <div className="mt-4 max-h-60 overflow-y-auto border p-3 rounded-md bg-white">
                <p className="text-sm whitespace-pre-wrap">{currentArticle.content}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">AI支援によるインサイト生成</h1>
                <p className="text-gray-500 mt-1">AIを活用して記事からインサイトを生成できます</p>
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
              
              {saveSuccess && (
                <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                  <AlertDescription>インサイトが正常に保存されました</AlertDescription>
                </Alert>
              )}
              
              <div className="mb-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                    インサイト生成のプロンプト（オプション）
                  </label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="特定の観点や切り口を指定できます（例：「ビジネス戦略の視点から分析してください」「技術的な洞察を抽出してください」）"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleGenerateInsights}
                    disabled={isGenerating || !currentArticle}
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner className="mr-2" size="small" />
                        生成中...
                      </>
                    ) : 'AIでインサイトを生成'}
                  </Button>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="generated">生成されたインサイト</TabsTrigger>
                  <TabsTrigger value="custom">カスタムインサイト</TabsTrigger>
                </TabsList>
                
                <TabsContent value="generated" className="pt-4">
                  {generatedInsights.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid gap-4">
                        {generatedInsights.map((insight, index) => (
                          <Card 
                            key={index}
                            className={`border ${insight.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          >
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-base flex items-center">
                                <input
                                  type="checkbox"
                                  checked={insight.selected}
                                  onChange={() => toggleInsightSelection(index)}
                                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                インサイト {index + 1}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <p className="text-sm whitespace-pre-wrap">{insight.content}</p>
                              
                              {insight.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {insight.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveSelectedInsights}
                          disabled={insightLoading || generatedInsights.filter(i => i.selected).length === 0}
                        >
                          {insightLoading && <LoadingSpinner className="mr-2" size="small" />}
                          選択したインサイトを保存
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed rounded-md">
                      {isGenerating ? (
                        <div className="flex flex-col items-center">
                          <LoadingSpinner size="large" className="mb-4" />
                          <p className="text-gray-500">インサイトを生成しています...</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500 mb-4">AIを使ってインサイトを生成しましょう</p>
                          <Button onClick={handleGenerateInsights} disabled={!currentArticle}>
                            インサイトを生成
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="custom" className="pt-4">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        インサイト内容 <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="content"
                        name="content"
                        value={customInsight.content}
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
                      
                      {customInsight.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {customInsight.tags.map((tag, idx) => (
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
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveCustomInsight}
                        disabled={insightLoading || !customInsight.content.trim()}
                      >
                        {insightLoading && <LoadingSpinner className="mr-2" size="small" />}
                        インサイトを保存
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AIInsightPage; 