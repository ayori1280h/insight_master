'use client';

import React, { useState, useEffect } from 'react';
import { Article } from '@/lib/models/article';
import { AnalysisLevel, InsightPoint, UserInsight } from '@/lib/models/insight';
import { InsightAnalyzer } from '@/lib/utils/insightAnalyzer';
import TrainingSession from '@/components/training/TrainingSession';
import FeedbackAnalysis from '@/components/visualization/FeedbackAnalysis';

interface TrainingResultProps {
  article: Article;
  userInsights: UserInsight[];
  level: AnalysisLevel;
  onComplete: () => void;
  onRetry: () => void;
}

export default function TrainingResult({
  article,
  userInsights,
  level,
  onComplete,
  onRetry
}: TrainingResultProps) {
  const [aiInsights, setAiInsights] = useState<InsightPoint[]>([]);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'comparison' | 'visualization'>('comparison');

  useEffect(() => {
    const analyzeArticle = async () => {
      setIsLoading(true);
      try {
        // 実際の実装では、APIを呼び出して分析を行う
        // このサンプル実装では、InsightAnalyzerを直接使用
        const analysis = InsightAnalyzer.analyzeArticle(article, level);
        setAiInsights(analysis.insights);

        // ユーザーの洞察とAIの洞察を比較
        const userInsightTexts = userInsights.map(insight => insight.description);
        const score = InsightAnalyzer.compareInsights(userInsightTexts, analysis.insights);
        setMatchScore(score);
      } catch (error) {
        console.error('記事の分析に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeArticle();
  }, [article, level, userInsights]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">分析結果を準備しています...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">トレーニング結果</h2>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-800">記事: {article.title}</h3>
            <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              難易度: {level}
            </div>
          </div>
          <p className="mt-2 text-gray-700">
            あなたは{userInsights.length}個の洞察ポイントを記録し、AIは{aiInsights.length}個のポイントを特定しました。
            マッチスコア: {matchScore}%
          </p>
        </div>
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              洞察の比較
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'visualization'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              視覚的フィードバック
            </button>
          </nav>
        </div>
        
        {activeTab === 'comparison' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 text-gray-700">あなたの洞察 ({userInsights.length})</h3>
              {userInsights.length > 0 ? (
                <div className="space-y-4">
                  {userInsights.map(insight => (
                    <div
                      key={insight.id}
                      className="p-3 bg-gray-50 rounded-md border"
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {insight.category}
                        </span>
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
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                  洞察が記録されていません
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-gray-700">AIの洞察 ({aiInsights.length})</h3>
              <div className="space-y-4">
                {aiInsights.map(insight => (
                  <div
                    key={insight.id}
                    className="p-3 bg-gray-50 rounded-md border"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                        {insight.category}
                      </span>
                      <span className="text-yellow-500 text-sm">
                        {'★'.repeat(insight.importance)}{'☆'.repeat(5 - insight.importance)}
                      </span>
                    </div>
                    <h4 className="mt-2 font-medium">{insight.title}</h4>
                    <p className="mt-1 text-gray-700">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'visualization' && (
          <FeedbackAnalysis
            userInsights={userInsights}
            aiInsights={aiInsights}
            matchScore={matchScore}
          />
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          別の記事でトレーニング
        </button>
        <button
          onClick={onComplete}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          トレーニングを完了
        </button>
      </div>
    </div>
  );
}
