import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { LoginRequest } from '@/lib/models/user';

/**
 * ログインAPIエンドポイント
 * POST /api/auth/login
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストボディの取得
    const body = await req.json();
    
    // バリデーション
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です。' },
        { status: 400 }
      );
    }
    
    const loginData: LoginRequest = {
      email: body.email,
      password: body.password,
    };
    
    // 認証サービスの初期化
    const authService = new AuthService();
    
    // ログイン処理
    const { token, user } = await authService.login(loginData);
    
    // レスポンス生成
    const response = NextResponse.json({ 
      message: 'ログインに成功しました。',
      user 
    });
    
    // Cookieにトークンを設定
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });
    
    return response;
  } catch (error) {
    console.error('ログインエラー:', error);
    
    // エラーレスポンス
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '認証に失敗しました。' },
      { status: 401 }
    );
  }
} 