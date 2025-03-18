'use client';

import React, { useState } from 'react';
import { Article } from '@/lib/models/article';
import { AnalysisLevel, UserInsight } from '@/lib/models/insight';
import UserInsightForm from './UserInsightForm';
import InsightComparison from './InsightComparison';

interface TrainingSessionProps {
  article: Article;
  initialLevel?: AnalysisLevel;
  onComplete: () => void;
}

export default function TrainingSession({
  article,
  initialLevel = AnalysisLevel.BEGINNER,
  onComplete
}: TrainingSessionProps) {
  const [currentStep, setCurrentStep] = useState<'reading' | 'insight' | 'comparison'>('reading');
  const [level, setLevel] = useState<AnalysisLevel>(initialLevel);
  const [userInsights, setUserInsights] = useState<UserInsight[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null);
  const [readingEndTime, setReadingEndTime] = useState<Date | null>(null);

  // 読書時間の計測開始
  React.useEffect(() => {
    if (currentStep === 'reading' && !readingStartTime) {
      setReadingStartTime(new Date());
    }
  }, [currentStep, readingStartTime]);

  const handleStartInsightRecording = () => {
    setReadingEndTime(new Date());
    setCurrentStep('insight');
  };

  const handleInsightSubmit = (insights: UserInsight[]) => {
    setUserInsights(insights);
    setCurrentStep('comparison');
  };

  const handleTrainingComplete = () => {
    onComplete();
  };

  const handleSetTimeLimit = (minutes: number) => {
    setTimeLimit(minutes * 60); // 秒に変換
  };

  const calculateReadingTime = (): string => {
    if (!readingStartTime || !readingEndTime) return '計測中...';
    
    const diffMs = readingEndTime.getTime() - readingStartTime.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffSec / 60);
    const seconds = diffSec % 60;
    
    return `${minutes}分${seconds}秒`;
  };

  return (
    <div>
      {currentStep === 'reading' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">記事を読む</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSetTimeLimit(3)}
                className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
              >
                3分
              </button>
              <button
                onClick={() => handleSetTimeLimit(5)}
                className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
              >
                5分
              </button>
              <button
                onClick={() => handleSetTimeLimit(10)}
                className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
              >
                10分
              </button>
              <button
                onClick={() => setTimeLimit(null)}
                className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
              >
                制限なし
              </button>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">{article.title}</h3>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>カテゴリー: {article.category}</span>
              <span>公開日: {article.publishedAt.toLocaleDateString()}</span>
            </div>
            <div className="prose max-w-none">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleStartInsightRecording}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            読み終わりました - 洞察を記録する
          </button>
        </div>
      )}

      {currentStep === 'insight' && (
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">記事情報</h3>
              <span className="text-sm text-gray-500">読書時間: {calculateReadingTime()}</span>
            </div>
            <h2 className="text-lg font-semibold mt-2">{article.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {article.summary || article.content.substring(0, 150) + '...'}
            </p>
          </div>
          
          <UserInsightForm
            article={article}
            level={level}
            onSubmit={handleInsightSubmit}
            timeLimit={timeLimit}
          />
        </div>
      )}

      {currentStep === 'comparison' && (
        <InsightComparison
          article={article}
          userInsights={userInsights}
          level={level}
          onComplete={handleTrainingComplete}
        />
      )}
    </div>
  );
}
