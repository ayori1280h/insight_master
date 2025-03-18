import { NextRequest, NextResponse } from 'next/server';

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
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // パブリックパスのチェック
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // APIリクエストのみ処理
  const isApiRequest = pathname.startsWith('/api/');
  
  // 認証が必要なAPIエンドポイントのみ処理
  if (isApiRequest && !isPublicPath) {
    // 認証トークンを確認
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です。' },
        { status: 401 }
      );
    }
    
    // 認証の詳細な検証はAPI側で行い、ここではトークンの存在確認のみ
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: '有効なトークンが必要です。' },
        { status: 401 }
      );
    }
    
    // トークンがあればリクエストを継続
    // 実際の検証はAPIルートで行う
    return NextResponse.next();
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