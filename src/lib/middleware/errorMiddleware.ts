import { NextRequest, NextResponse } from 'next/server';

/**
 * APIエラークラス
 * カスタムエラーメッセージとステータスコードを持つ
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * エラーハンドリングミドルウェア
 * APIエンドポイントで発生したエラーを適切に処理する
 * @param error エラーオブジェクト
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('APIエラー:', error);
  
  // ApiErrorの場合は指定されたステータスコードを使用
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  
  // 一般的なエラーの場合
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  // 不明なエラーの場合
  return NextResponse.json(
    { error: '予期しないエラーが発生しました。' },
    { status: 500 }
  );
}

/**
 * エラーハンドリングを適用する高階関数
 * @param handler APIハンドラ関数
 * @returns エラーハンドリングを含むラップされたハンドラ
 */
export function withErrorHandling<T>(
  handler: (req: NextRequest, ...args: any[]) => Promise<T>
) {
  return async (req: NextRequest, ...args: any[]): Promise<T | NextResponse> => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
} 