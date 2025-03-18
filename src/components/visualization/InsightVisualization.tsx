'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { InsightCategory, InsightCategoryColor } from '@/lib/models/insight';

interface InsightCategoryData {
  name: string;
  userCount: number;
  aiCount: number;
  matchCount: number;
}

interface InsightVisualizationProps {
  userInsightCategories: Record<string, number>;
  aiInsightCategories: Record<string, number>;
  matchedCategories: Record<string, number>;
  overallMatchScore: number;
}

export default function InsightVisualization({
  userInsightCategories,
  aiInsightCategories,
  matchedCategories,
  overallMatchScore
}: InsightVisualizationProps) {
  // カテゴリー別のデータを作成
  const categoryData: InsightCategoryData[] = Object.values(InsightCategory).map(category => {
    return {
      name: category,
      userCount: userInsightCategories[category] || 0,
      aiCount: aiInsightCategories[category] || 0,
      matchCount: matchedCategories[category] || 0
    };
  });

  // マッチスコアのデータを作成
  const matchScoreData = [
    { name: 'マッチ', value: overallMatchScore },
    { name: '未マッチ', value: 100 - overallMatchScore }
  ];

  // カテゴリーの色を取得
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'blue': '#3B82F6',
      'green': '#10B981',
      'red': '#EF4444',
      'purple': '#8B5CF6',
      'yellow': '#F59E0B',
      'indigo': '#6366F1'
    };
    
    const categoryKey = Object.values(InsightCategory).find(cat => cat === category);
    if (categoryKey && categoryKey in InsightCategoryColor) {
      return colorMap[InsightCategoryColor[categoryKey as InsightCategory]] || '#9CA3AF';
    }
    return '#9CA3AF';
  };

  // マッチスコアの色
  const MATCH_COLORS = ['#10B981', '#E5E7EB'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">洞察力分析の視覚化</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-medium mb-4 text-center">カテゴリー別の洞察ポイント比較</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="userCount" name="あなたの洞察" fill="#3B82F6" />
                <Bar dataKey="aiCount" name="AIの洞察" fill="#8B5CF6" />
                <Bar dataKey="matchCount" name="マッチした洞察" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>このグラフは、各カテゴリーにおけるあなたの洞察ポイント数とAIの洞察ポイント数、そして両者がマッチした数を比較しています。</p>
            <p className="mt-2">あなたが見落としがちなカテゴリーや、特に注目しているカテゴリーを確認できます。</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-4 text-center">洞察マッチスコア</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={matchScoreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {matchScoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MATCH_COLORS[index % MATCH_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>このグラフは、あなたの洞察ポイントとAIの洞察ポイントがどれだけマッチしているかを示しています。</p>
            <p className="mt-2">
              {overallMatchScore >= 80 && '素晴らしい洞察力です！AIと同様の重要なポイントを見抜いています。'}
              {overallMatchScore >= 50 && overallMatchScore < 80 && '良い洞察力です。さらに多角的な視点を持つことで、より深い洞察ができるでしょう。'}
              {overallMatchScore < 50 && 'AIとは異なる視点を持っています。見落としがちなポイントに注目することで、洞察力を向上させることができます。'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="font-medium mb-4">カテゴリー別の強み・弱み</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(InsightCategory).map(category => {
            const userCount = userInsightCategories[category] || 0;
            const aiCount = aiInsightCategories[category] || 0;
            const ratio = aiCount > 0 ? (userCount / aiCount) * 100 : 0;
            
            let strengthLevel = 'neutral';
            if (ratio >= 100) strengthLevel = 'strong';
            else if (ratio >= 50) strengthLevel = 'moderate';
            else strengthLevel = 'weak';
            
            return (
              <div 
                key={category}
                className="p-4 rounded-lg border"
                style={{ borderColor: getCategoryColor(category) }}
              >
                <h4 className="font-medium" style={{ color: getCategoryColor(category) }}>{category}</h4>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, ratio)}%`,
                        backgroundColor: getCategoryColor(category)
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{Math.round(ratio)}%</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {strengthLevel === 'strong' && 'このカテゴリーはあなたの強みです。'}
                  {strengthLevel === 'moderate' && 'このカテゴリーは平均的な洞察力です。'}
                  {strengthLevel === 'weak' && 'このカテゴリーは改善の余地があります。'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
