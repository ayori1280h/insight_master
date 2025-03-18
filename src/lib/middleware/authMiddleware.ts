import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/authService';

/**
 * 認証ミドルウェア
 * JWTトークンを検証し、有効な場合はユーザーIDをリクエストヘッダーに追加します
 * @param req リクエストオブジェクト
 */
export async function authMiddleware(req: NextRequest): Promise<NextResponse | null> {
  // パブリックルートはスキップ
  if (isPublicRoute(req.nextUrl.pathname)) {
    return null;
  }

  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です。' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const authService = new AuthService();
    const validationResult = await authService.validateToken(token);
    
    if (!validationResult.isValid || !validationResult.user) {
      return NextResponse.json(
        { error: validationResult.error || 'トークンが無効です。' },
        { status: 401 }
      );
    }
    
    // ユーザーIDをヘッダーに追加（次のハンドラで使用）
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', validationResult.user.id);
    
    // ユーザーロールも追加（権限チェック用）
    requestHeaders.set('x-user-role', validationResult.user.role);
    
    // 元のリクエストを複製し、新しいヘッダーを設定
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('認証ミドルウェアエラー:', error);
    
    return NextResponse.json(
      { error: '認証処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * パブリックルート（認証不要）かどうかを判定
 * @param path リクエストパス
 * @returns パブリックルートの場合はtrue
 */
function isPublicRoute(path: string): boolean {
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health'
  ];
  
  return publicRoutes.some(route => path.startsWith(route));
} 