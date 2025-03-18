import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を結合するユーティリティ関数
 * clsxとtailwind-mergeを組み合わせて使用します
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 指定された範囲の数値に制限するユーティリティ関数
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Fetch APIを使ったHTTPリクエストを行うユーティリティ関数
 */
export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // ローカルストレージからトークンを取得
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ヘッダーの設定
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // リクエストの実行
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // レスポンスの処理
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || response.statusText || '予期しないエラーが発生しました';
    
    // 401エラーの場合はトークンが無効なのでローカルストレージから削除
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    
    throw new Error(errorMessage);
  }

  // レスポンスデータを返却
  return await response.json() as T;
}

/**
 * 日付をフォーマットするユーティリティ関数
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * テキストを省略するユーティリティ関数
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
} 