'use client';

import React, { useState } from 'react';
import { Article } from '@/lib/models/article';
import { AnalysisLevel, InsightCategory, UserInsight } from '@/lib/models/insight';

interface UserInsightFormProps {
  article: Article;
  level: AnalysisLevel;
  onSubmit: (insights: UserInsight[]) => void;
  timeLimit?: number; // 秒単位
}

export default function UserInsightForm({ 
  article, 
  level, 
  onSubmit,
  timeLimit 
}: UserInsightFormProps) {
  const [insights, setInsights] = useState<UserInsight[]>([]);
  const [currentCategory, setCurrentCategory] = useState<InsightCategory>(InsightCategory.HIDDEN_ASSUMPTION);
  const [currentDescription, setCurrentDescription] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit || null);
  const [isTimerRunning, setIsTimerRunning] = useState(!!timeLimit);
  
  // タイマー機能
  React.useEffect(() => {
    if (!isTimerRunning || timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      setIsTimerRunning(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, isTimerRunning]);
  
  // 時間のフォーマット（mm:ss）
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentCategory(e.target.value as InsightCategory);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentDescription(e.target.value);
  };
  
  const handleSelectedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedText(e.target.value);
  };
  
  const handleAddInsight = () => {
    if (!currentDescription.trim()) return;
    
    const newInsight: UserInsight = {
      id: `user-insight-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: 'current-user', // 実際の実装では認証システムからユーザーIDを取得
      articleId: article.id,
      category: currentCategory,
      description: currentDescription,
      relatedText: selectedText.trim() || undefined,
      createdAt: new Date()
    };
    
    setInsights([...insights, newInsight]);
    setCurrentDescription('');
    setSelectedText('');
  };
  
  const handleRemoveInsight = (id: string) => {
    setInsights(insights.filter(insight => insight.id !== id));
  };
  
  const handleSubmitInsights = () => {
    onSubmit(insights);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">洞察ポイントの記録</h2>
        
        {timeRemaining !== null && (
          <div className={`px-3 py-1 rounded-md ${
            timeRemaining < 30 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            残り時間: {formatTime(timeRemaining)}
          </div>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">トレーニングモード: {level}</h3>
        <p className="text-sm text-gray-600">
          {level === AnalysisLevel.BEGINNER && 
            '初級モードでは、記事を読んだ後にあなたの洞察を記録します。その後、AIの分析結果と比較できます。'}
          {level === AnalysisLevel.INTERMEDIATE && 
            '中級モードでは、AIがヒントを提供し、それを参考にあなたの洞察を深めることができます。'}
          {level === AnalysisLevel.ADVANCED && 
            '上級モードでは、まずあなた自身の洞察を記録し、その後AIがフィードバックを提供します。'}
        </p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリー
        </label>
        <select
          id="category"
          value={currentCategory}
          onChange={handleCategoryChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(InsightCategory).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          洞察の説明
        </label>
        <textarea
          id="description"
          value={currentDescription}
          onChange={handleDescriptionChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="あなたの洞察を記入してください..."
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="selectedText" className="block text-sm font-medium text-gray-700 mb-1">
          関連テキスト（オプション）
        </label>
        <textarea
          id="selectedText"
          value={selectedText}
          onChange={handleSelectedTextChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="記事から関連する部分をコピー＆ペーストしてください..."
        />
      </div>
      
      <button
        onClick={handleAddInsight}
        disabled={!currentDescription.trim()}
        className={`mb-6 px-4 py-2 rounded-md text-white font-medium ${
          !currentDescription.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        洞察を追加
      </button>
      
      {insights.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-3">記録した洞察 ({insights.length})</h3>
          <div className="space-y-3">
            {insights.map(insight => (
              <div key={insight.id} className="p-3 bg-gray-50 rounded-md border">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    {insight.category}
                  </span>
                  <button
                    onClick={() => handleRemoveInsight(insight.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-2 text-gray-700">{insight.description}</p>
                {insight.relatedText && (
                  <div className="mt-2 p-2 bg-gray-100 text-sm italic">
                    "{insight.relatedText}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={handleSubmitInsights}
        disabled={insights.length === 0}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          insights.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        分析結果を見る
      </button>
    </div>
  );
}
