import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 認証トークン付きのfetch関数
 * @param url リクエスト先URL
 * @param options fetchオプション
 * @returns レスポンスデータ
 */
export async function fetchWithAuth<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // クッキーからトークンを取得
  const token = getAuthToken();
  
  // ヘッダーを準備
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // 認証トークンが存在する場合はAuthorizationヘッダーに設定
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // リクエスト実行
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // クッキーを含める
  });
  
  // エラーレスポンスの場合はエラーをスロー
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText || 'APIリクエストエラー';
    const error = new Error(errorMessage);
    throw error;
  }
  
  // レスポンスがない場合は空オブジェクトを返す
  if (response.status === 204) {
    return {} as T;
  }
  
  // JSONレスポンスをパース
  return response.json();
}

/**
 * クッキーから認証トークンを取得
 * @returns 認証トークンまたはnull
 */
function getAuthToken(): string | null {
  // クライアントサイドでのみ実行
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

/**
 * 日付をフォーマットする関数
 * @param dateString 日付文字列
 * @param options 表示オプション
 * @returns フォーマットされた日付文字列
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', options).format(date);
}
