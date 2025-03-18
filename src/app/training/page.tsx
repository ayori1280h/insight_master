'use client';

import React, { useState } from 'react';
import { Article } from '@/lib/models/article';
import { AnalysisLevel } from '@/lib/models/insight';
import { ArticleLoader } from '@/lib/utils/articleLoader';
import TrainingSession from '@/components/training/TrainingSession';

export default function TrainingPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<AnalysisLevel>(AnalysisLevel.BEGINNER);
  const [articles, setArticles] = useState<Article[]>(ArticleLoader.getSampleArticles());
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel(e.target.value as AnalysisLevel);
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleStartTraining = () => {
    if (selectedArticle) {
      setIsTrainingStarted(true);
    }
  };

  const handleTrainingComplete = () => {
    setIsTrainingStarted(false);
    setSelectedArticle(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">洞察力トレーニング</h1>

      {isTrainingStarted && selectedArticle ? (
        <TrainingSession
          article={selectedArticle}
          initialLevel={selectedLevel}
          onComplete={handleTrainingComplete}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">トレーニング設定</h2>

              <div className="mb-4">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  難易度レベル
                </label>
                <select
                  id="level"
                  value={selectedLevel}
                  onChange={handleLevelChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(AnalysisLevel).map(level => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedLevel === AnalysisLevel.BEGINNER && 
                    '初級: AIが洞察ポイントを直接提示します。'}
                  {selectedLevel === AnalysisLevel.INTERMEDIATE && 
                    '中級: AIがヒントを出し、あなたが洞察を試みます。'}
                  {selectedLevel === AnalysisLevel.ADVANCED && 
                    '上級: あなたが先に洞察を行い、AIがフィードバックします。'}
                </p>
              </div>

              <button
                onClick={handleStartTraining}
                disabled={!selectedArticle}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  !selectedArticle ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                トレーニングを開始
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">記事を選択</h2>

              <div className="space-y-4">
                {articles.map(article => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleSelect(article)}
                    className={`p-4 border rounded-md cursor-pointer transition-all ${
                      selectedArticle?.id === article.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-medium">{article.title}</h3>
                    <div className="flex justify-between text-sm text-gray-500 mt-1 mb-2">
                      <span>カテゴリー: {article.category}</span>
                      <span>読書時間: 約{article.readingTime}分</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {article.summary || article.content.substring(0, 150) + '...'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
