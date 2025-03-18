'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// カテゴリデータの型定義
interface CategoryData {
  name: string;
  count: number;
  color: string;
}

interface InsightCategoryChartProps {
  data?: CategoryData[];
  className?: string;
  loading?: boolean;
}

export default function InsightCategoryChart({ data = [], className = '', loading = false }: InsightCategoryChartProps) {
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  
  // データがない場合はサンプルデータを生成
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    } else if (!loading) {
      // サンプルデータを生成（実装時は削除）
      const sampleData: CategoryData[] = [
        { name: 'テクノロジー', count: 15, color: '#3B82F6' },
        { name: 'ビジネス', count: 10, color: '#10B981' },
        { name: '科学', count: 8, color: '#6366F1' },
        { name: '健康', count: 5, color: '#F59E0B' },
        { name: '教育', count: 7, color: '#EC4899' },
        { name: 'その他', count: 3, color: '#6B7280' },
      ];
      setChartData(sampleData);
    }
  }, [data, loading]);

  // 合計数の計算
  const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
  
  // 円グラフのデータ生成
  const generatePieChart = () => {
    if (chartData.length === 0) return null;
    
    let cumulativePercentage = 0;
    const segments = chartData.map((item, index) => {
      const percentage = (item.count / totalCount) * 100;
      const startAngle = cumulativePercentage;
      cumulativePercentage += percentage;
      const endAngle = cumulativePercentage;
      
      const startX = 50 + 40 * Math.cos(((startAngle / 100) * 360 - 90) * (Math.PI / 180));
      const startY = 50 + 40 * Math.sin(((startAngle / 100) * 360 - 90) * (Math.PI / 180));
      const endX = 50 + 40 * Math.cos(((endAngle / 100) * 360 - 90) * (Math.PI / 180));
      const endY = 50 + 40 * Math.sin(((endAngle / 100) * 360 - 90) * (Math.PI / 180));
      
      const largeArcFlag = percentage > 50 ? 1 : 0;
      
      return (
        <path
          key={index}
          d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
          fill={item.color}
          stroke="#ffffff"
          strokeWidth="1"
        />
      );
    });
    
    return (
      <svg className="w-full" viewBox="0 0 100 100">
        {segments}
      </svg>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">インサイトカテゴリ分布</CardTitle>
        <CardDescription>
          インサイトのカテゴリ別割合
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-40 w-40 bg-gray-200 rounded-full mx-auto"></div>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-gray-400">
            データがありません
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-40 h-40 mb-4 md:mb-0">
              {generatePieChart()}
            </div>
            
            <div className="flex flex-col space-y-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm mr-2">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    {item.count}（{Math.round((item.count / totalCount) * 100)}%）
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 