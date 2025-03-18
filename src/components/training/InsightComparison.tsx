'use client';

import React, { useState } from 'react';
import { Article } from '@/lib/models/article';
import { AnalysisLevel, InsightAnalysis, InsightPoint, UserInsight } from '@/lib/models/insight';
import { InsightAnalyzer } from '@/lib/utils/insightAnalyzer';
import InsightCard from '../insight/InsightCard';

interface InsightComparisonProps {
  article: Article;
  userInsights: UserInsight[];
  level: AnalysisLevel;
  onComplete: () => void;
}

export default function InsightComparison({
  article,
  userInsights,
  level,
  onComplete
}: InsightComparisonProps) {
  const [aiAnalysis, setAiAnalysis] = useState<InsightAnalysis | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'comparison' | 'user' | 'ai'>('comparison');
  const [selectedUserInsight, setSelectedUserInsight] = useState<string | null>(null);
  const [selectedAiInsight, setSelectedAiInsight] = useState<string | null>(null);

  // AIによる分析を実行
  React.useEffect(() => {
    const analyzeArticle = async () => {
      setIsLoading(true);
      try {
        // 実際の実装では、APIを呼び出して分析を行う
        // このサンプル実装では、InsightAnalyzerを直接使用
        const analysis = InsightAnalyzer.analyzeArticle(article, level);
        setAiAnalysis(analysis);

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

  if (isLoading || !aiAnalysis) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">AIが記事を分析しています...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">洞察力分析結果</h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-blue-800">分析サマリー</h3>
          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            マッチスコア: {matchScore}%
          </div>
        </div>
        <p className="text-gray-700">{aiAnalysis.summary}</p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              比較ビュー
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              あなたの洞察 ({userInsights.length})
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AIの洞察 ({aiAnalysis.insights.length})
            </button>
          </nav>
        </div>

        <div className="mt-4">
          {activeTab === 'comparison' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3 text-gray-700">あなたの洞察</h3>
                {userInsights.length > 0 ? (
                  <div className="space-y-4">
                    {userInsights.map(insight => (
                      <div
                        key={insight.id}
                        onClick={() => setSelectedUserInsight(insight.id === selectedUserInsight ? null : insight.id)}
                        className={`p-3 bg-gray-50 rounded-md border cursor-pointer transition-all ${
                          insight.id === selectedUserInsight ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:shadow-md'
                        }`}
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
                <h3 className="font-medium mb-3 text-gray-700">AIの洞察</h3>
                <div className="space-y-4">
                  {aiAnalysis.insights.map(insight => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      isSelected={insight.id === selectedAiInsight}
                      onSelect={() => setSelectedAiInsight(insight.id === selectedAiInsight ? null : insight.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'user' && (
            <div className="space-y-4">
              {userInsights.length > 0 ? (
                userInsights.map(insight => (
                  <div key={insight.id} className="p-4 bg-gray-50 rounded-md border">
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
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                  洞察が記録されていません
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiAnalysis.insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-medium mb-3">次のステップ</h3>
        <p className="text-gray-600 mb-4">
          この分析結果を参考に、次回のトレーニングではより深い洞察を心がけましょう。
          特に見落としがちなポイントに注目することで、洞察力を向上させることができます。
        </p>
        <button
          onClick={onComplete}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          トレーニングを完了する
        </button>
      </div>
    </div>
  );
}
