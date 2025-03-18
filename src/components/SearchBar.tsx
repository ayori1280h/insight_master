'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchBarProps {
  placeholder?: string;
  searchType?: 'articles' | 'insights';
  className?: string;
  showFilter?: boolean;
  onSearch?: (query: string, filter: string) => void;
}

export default function SearchBar({
  placeholder = '検索...',
  searchType = 'articles',
  className = '',
  showFilter = true,
  onSearch
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get('query') || '';
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  // デバウンス処理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // 検索パラメータが変更されたときの処理
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery, filter);
    } else {
      // URLパラメータでの検索処理
      const params = new URLSearchParams();
      
      if (debouncedQuery) {
        params.set('query', debouncedQuery);
      } else {
        params.delete('query');
      }
      
      if (filter && filter !== 'all') {
        params.set('filter', filter);
      } else {
        params.delete('filter');
      }
      
      const newPath = params.toString() 
        ? `${pathname}?${params.toString()}`
        : pathname;
        
      router.push(newPath);
    }
  }, [debouncedQuery, filter, onSearch, pathname, router]);
  
  // フィルターオプションの設定
  const filterOptions = searchType === 'articles' 
    ? [
        { value: 'all', label: 'すべて' },
        { value: 'title', label: 'タイトル' },
        { value: 'content', label: 'コンテンツ' },
        { value: 'source', label: '出典' },
        { value: 'tags', label: 'タグ' }
      ]
    : [
        { value: 'all', label: 'すべて' },
        { value: 'content', label: 'コンテンツ' },
        { value: 'article', label: '関連記事' },
        { value: 'date', label: '日付' }
      ];
  
  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-10"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="クリア"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {showFilter && (
        <Select
          value={filter}
          onValueChange={setFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="フィルター" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
} 