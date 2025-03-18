'use client';

import React, { useState } from 'react';
import { InsightPoint, InsightCategory, AnalysisLevel } from '@/lib/models/insight';
import { Article } from '@/lib/models/article';
import { InsightAnalyzer } from '@/lib/utils/insightAnalyzer';
import InsightCard from './InsightCard';

interface InsightAnalysisViewProps {
  article: Article;
  analysisLevel?: AnalysisLevel;
}

export default function InsightAnalysisView({ 
  article, 
  analysisLevel = AnalysisLevel.BEGINNER 
}: InsightAnalysisViewProps) {
  const [insights, setInsights] = useState<InsightPoint[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | 'all'>('all');
  
  const analyzeArticle = async () => {
    setIsAnalyzing(true);
    
    try {
      // 実際の実装では、APIを呼び出して分析を行う
      // このサンプル実装では、InsightAnalyzerを直接使用
      const analysis = InsightAnalyzer.analyzeArticle(article, analysisLevel);
      
      setInsights(analysis.insights);
      setSummary(analysis.summary);
      setIsAnalyzed(true);
    } catch (error) {
      console.error('記事の分析に失敗しました:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);
  
  const categoryCount = insights.reduce((acc, insight) => {
    acc[insight.category] = (acc[insight.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">洞察ポイント分析</h2>
      
      {!isAnalyzed ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-6">
            AIが記事を分析し、洞察すべきポイントを提示します。
            {analysisLevel === AnalysisLevel.BEGINNER && '初級モードでは、AIが洞察ポイントを直接提示します。'}
            {analysisLevel === AnalysisLevel.INTERMEDIATE && '中級モードでは、AIがヒントを出し、あなたが洞察を試みます。'}
            {analysisLevel === AnalysisLevel.ADVANCED && '上級モードでは、あなたが先に洞察を行い、AIがフィードバックします。'}
          </p>
          <button
            onClick={analyzeArticle}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-md text-white font-medium ${
              isAnalyzing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isAnalyzing ? '分析中...' : '記事を分析する'}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">分析サマリー</h3>
            <p className="text-gray-700">{summary}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">カテゴリーでフィルター</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedCategory === 'all' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                すべて ({insights.length})
              </button>
              
              {Object.entries(categoryCount).map(([category, count]) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as InsightCategory)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedCategory === category 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category} ({count})
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInsights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
          
          {filteredInsights.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">選択したカテゴリーの洞察ポイントはありません。</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
