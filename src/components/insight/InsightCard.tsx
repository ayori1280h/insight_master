'use client';

import React, { useState } from 'react';
import { InsightPoint, InsightCategory, InsightCategoryDescription, InsightCategoryColor } from '@/lib/models/insight';

interface InsightCardProps {
  insight: InsightPoint;
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function InsightCard({ insight, onSelect, isSelected = false }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getCategoryColor = (category: InsightCategory) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-100 text-blue-800',
      'green': 'bg-green-100 text-green-800',
      'red': 'bg-red-100 text-red-800',
      'purple': 'bg-purple-100 text-purple-800',
      'yellow': 'bg-yellow-100 text-yellow-800',
      'indigo': 'bg-indigo-100 text-indigo-800'
    };
    
    return colorMap[InsightCategoryColor[category]] || 'bg-gray-100 text-gray-800';
  };
  
  const getImportanceStars = (importance: number) => {
    return '★'.repeat(importance) + '☆'.repeat(5 - importance);
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div 
      className={`border rounded-lg p-4 transition-all duration-200 ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(insight.category)}`}>
          {insight.category}
        </span>
        <span className="text-yellow-500 text-sm" title={`重要度: ${insight.importance}/5`}>
          {getImportanceStars(insight.importance)}
        </span>
      </div>
      
      <h3 className="font-medium mb-2">{insight.title}</h3>
      
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-20'}`}>
        <p className="text-gray-600 text-sm">
          {insight.description}
        </p>
        
        {insight.relatedText && (
          <div className="mt-3 p-2 bg-gray-50 border-l-4 border-gray-300 text-sm italic">
            "{insight.relatedText}"
          </div>
        )}
        
        <div className="mt-3">
          <p className="text-xs text-gray-500">
            <span className="font-medium">カテゴリー説明:</span> {InsightCategoryDescription[insight.category]}
          </p>
        </div>
      </div>
      
      <button 
        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand();
        }}
      >
        {isExpanded ? '折りたたむ' : 'もっと見る'}
      </button>
    </div>
  );
}
