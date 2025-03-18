import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { withErrorHandling } from '@/lib/middleware/errorMiddleware';

/**
 * GETリクエストハンドラ - トークンの検証を行い、ユーザー情報を返す
 * @param req リクエストオブジェクト
 * @returns ユーザー情報を含むレスポンス
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: '認証トークンが必要です' },
      { status: 401 }
    );
  }
  
  const token = authHeader.split(' ')[1];
  const authService = new AuthService();
  
  const validationResult = await authService.validateToken(token);
  
  if (!validationResult.isValid || !validationResult.user) {
    return NextResponse.json(
      { error: validationResult.error || 'トークンが無効です' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    user: validationResult.user
  });
}); 