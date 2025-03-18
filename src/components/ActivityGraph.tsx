'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// グラフデータの型定義
interface ActivityData {
  date: string;
  articles: number;
  insights: number;
}

interface ActivityGraphProps {
  data?: ActivityData[];
  className?: string;
  loading?: boolean;
}

export default function ActivityGraph({ data = [], className = '', loading = false }: ActivityGraphProps) {
  const [graphData, setGraphData] = useState<ActivityData[]>([]);
  
  // データがない場合はサンプルデータを生成
  useEffect(() => {
    if (data && data.length > 0) {
      setGraphData(data);
    } else if (!loading) {
      // サンプルデータを生成（実装時は削除）
      const sampleData: ActivityData[] = Array.from({ length: 30 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          articles: Math.floor(Math.random() * 3),
          insights: Math.floor(Math.random() * 5)
        };
      });
      setGraphData(sampleData);
    }
  }, [data, loading]);

  // グラフの最大値を計算
  const maxValue = Math.max(
    ...graphData.map(item => Math.max(item.articles, item.insights)),
    3 // 最小でも3の高さを確保
  );

  // 週ごとのラベルを生成
  const getWeekLabels = () => {
    if (graphData.length === 0) return [];
    
    const labels: string[] = [];
    for (let i = 0; i < graphData.length; i += 7) {
      if (i < graphData.length) {
        const date = new Date(graphData[i].date);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
      }
    }
    return labels;
  };

  const weekLabels = getWeekLabels();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">アクティビティグラフ</CardTitle>
        <CardDescription>
          過去30日間の記事とインサイトの作成状況
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : graphData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-gray-400">
            データがありません
          </div>
        ) : (
          <div className="pt-2">
            <div className="flex justify-between mb-2 text-xs text-gray-500">
              {weekLabels.map((label, index) => (
                <div key={index} className="text-center">
                  {label}
                </div>
              ))}
            </div>
            
            <div className="relative h-40">
              <div className="absolute inset-0 flex items-end">
                {graphData.map((item, index) => (
                  <div key={index} className="flex-1 h-full flex flex-col justify-end items-center">
                    <div 
                      className="w-2 bg-blue-500 rounded-t"
                      style={{ 
                        height: `${(item.articles / maxValue) * 100}%`,
                        opacity: item.articles === 0 ? 0.3 : 0.7
                      }}
                    ></div>
                    <div 
                      className="w-2 bg-purple-500 rounded-t mt-1"
                      style={{ 
                        height: `${(item.insights / maxValue) * 100}%`,
                        opacity: item.insights === 0 ? 0.3 : 0.7
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-4 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 mr-2 rounded"></div>
                <span className="text-sm">記事</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 mr-2 rounded"></div>
                <span className="text-sm">インサイト</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 