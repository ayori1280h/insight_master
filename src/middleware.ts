import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './lib/services/authService';
import { authMiddleware } from './lib/middleware/authMiddleware';

// 認証が不要なパス
const publicPaths = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/',
  '/_next', // Next.jsの静的アセット
  '/favicon.ico',
];

/**
 * ミドルウェア関数
 * @param req リクエストオブジェクト
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // パブリックパスのチェック
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // APIリクエストのみ処理
  const isApiRequest = pathname.startsWith('/api/');
  
  // 認証が必要なAPIエンドポイントのみ処理
  if (isApiRequest && !isPublicPath) {
    // 認証ミドルウェアを実行
    const authResponse = await authMiddleware(req);
    
    // 認証ミドルウェアがレスポンスを返した場合（認証エラー）
    if (authResponse) {
      return authResponse;
    }
  }

  // 公開パスまたは非APIリクエストは処理せずに続行
  return NextResponse.next();
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    /*
     * 以下のパスにマッチします:
     * - `/api/:path*` (APIルート)
     * 以下は除外します:
     * - `/api/auth/:path*` (認証API)
     * - 静的ファイル (画像、JS、CSSなど)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 