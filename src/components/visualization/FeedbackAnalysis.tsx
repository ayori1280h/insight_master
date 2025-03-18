'use client';

import React, { useState, useEffect } from 'react';
import { InsightPoint, UserInsight, InsightCategory } from '@/lib/models/insight';
import InsightVisualization from './InsightVisualization';

interface FeedbackAnalysisProps {
  userInsights: UserInsight[];
  aiInsights: InsightPoint[];
  matchScore: number;
}

export default function FeedbackAnalysis({
  userInsights,
  aiInsights,
  matchScore
}: FeedbackAnalysisProps) {
  const [userCategories, setUserCategories] = useState<Record<string, number>>({});
  const [aiCategories, setAiCategories] = useState<Record<string, number>>({});
  const [matchedCategories, setMatchedCategories] = useState<Record<string, number>>({});
  const [strengths, setStrengths] = useState<InsightCategory[]>([]);
  const [weaknesses, setWeaknesses] = useState<InsightCategory[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // カテゴリー別のカウントを計算
    const userCats: Record<string, number> = {};
    const aiCats: Record<string, number> = {};
    const matchedCats: Record<string, number> = {};

    // ユーザーの洞察カテゴリーをカウント
    userInsights.forEach(insight => {
      userCats[insight.category] = (userCats[insight.category] || 0) + 1;
    });

    // AIの洞察カテゴリーをカウント
    aiInsights.forEach(insight => {
      aiCats[insight.category] = (aiCats[insight.category] || 0) + 1;
    });

    // マッチしたカテゴリーを計算（簡易的な実装）
    Object.keys(userCats).forEach(category => {
      if (aiCats[category]) {
        matchedCats[category] = Math.min(userCats[category], aiCats[category]);
      }
    });

    setUserCategories(userCats);
    setAiCategories(aiCats);
    setMatchedCategories(matchedCats);

    // 強みと弱みを分析
    analyzeStrengthsAndWeaknesses(userCats, aiCats);
    
    // レコメンデーションを生成
    generateRecommendations(userCats, aiCats);
  }, [userInsights, aiInsights]);

  // 強みと弱みを分析する関数
  const analyzeStrengthsAndWeaknesses = (
    userCats: Record<string, number>,
    aiCats: Record<string, number>
  ) => {
    const strengthsList: InsightCategory[] = [];
    const weaknessesList: InsightCategory[] = [];

    Object.values(InsightCategory).forEach(category => {
      const userCount = userCats[category] || 0;
      const aiCount = aiCats[category] || 0;

      if (aiCount === 0) return; // AIが指摘していないカテゴリーはスキップ

      const ratio = userCount / aiCount;

      if (ratio >= 0.8) {
        strengthsList.push(category);
      } else if (ratio <= 0.3) {
        weaknessesList.push(category);
      }
    });

    setStrengths(strengthsList);
    setWeaknesses(weaknessesList);
  };

  // レコメンデーションを生成する関数
  const generateRecommendations = (
    userCats: Record<string, number>,
    aiCats: Record<string, number>
  ) => {
    const recs: string[] = [];

    // 全体的なマッチスコアに基づくレコメンデーション
    if (matchScore >= 80) {
      recs.push('あなたは優れた洞察力を持っています。さらに専門的な記事に挑戦してみましょう。');
    } else if (matchScore >= 50) {
      recs.push('良い洞察力です。より多角的な視点を持つことで、洞察力をさらに向上させることができます。');
    } else {
      recs.push('基本的な洞察のパターンを学ぶことで、重要なポイントを見逃さないようになります。');
    }

    // 弱点カテゴリーに基づくレコメンデーション
    Object.values(InsightCategory).forEach(category => {
      const userCount = userCats[category] || 0;
      const aiCount = aiCats[category] || 0;

      if (aiCount > 0 && userCount / aiCount < 0.3) {
        switch (category) {
          case InsightCategory.HIDDEN_ASSUMPTION:
            recs.push('文章の隠れた前提条件を見つける練習をしましょう。「この主張が成り立つためには何が前提となっているか？」と自問してみてください。');
            break;
          case InsightCategory.CAUSALITY:
            recs.push('因果関係の分析を強化するために、「なぜ？」という質問を繰り返し、根本原因を探る習慣をつけましょう。');
            break;
          case InsightCategory.CONTRADICTION:
            recs.push('文章内の矛盾点を見つけるために、主張同士の整合性をチェックする習慣をつけましょう。');
            break;
          case InsightCategory.DATA_INTERPRETATION:
            recs.push('データの解釈方法を学ぶために、統計の基本概念や一般的な誤用パターンについて学習することをお勧めします。');
            break;
          case InsightCategory.AUTHOR_BIAS:
            recs.push('著者のバイアスを見抜くために、著者の背景や立場を考慮し、別の視点からも情報を検証する習慣をつけましょう。');
            break;
          case InsightCategory.INDUSTRY_TREND:
            recs.push('業界トレンドとの関連性を理解するために、関連分野の最新動向をフォローし、歴史的な文脈も考慮しましょう。');
            break;
        }
      }
    });

    setRecommendations(recs);
  };

  return (
    <div className="space-y-8">
      <InsightVisualization
        userInsightCategories={userCategories}
        aiInsightCategories={aiCategories}
        matchedCategories={matchedCategories}
        overallMatchScore={matchScore}
      />
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">パーソナライズされたフィードバック</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">あなたの強み</h3>
          {strengths.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {strengths.map(strength => (
                <li key={strength} className="text-green-700">{strength}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">まだ特定の強みは見つかっていません。トレーニングを続けましょう。</p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">改善できる点</h3>
          {weaknesses.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {weaknesses.map(weakness => (
                <li key={weakness} className="text-red-700">{weakness}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">素晴らしい！特に改善が必要な点は見つかりませんでした。</p>
          )}
        </div>
        
        <div>
          <h3 className="font-medium mb-2">おすすめのトレーニング</h3>
          {recommendations.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-blue-700">{rec}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">トレーニングを続けることで、パーソナライズされたレコメンデーションが表示されます。</p>
          )}
        </div>
      </div>
    </div>
  );
}
