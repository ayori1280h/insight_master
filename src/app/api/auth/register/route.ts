import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { RegisterRequest } from '@/lib/models/user';

/**
 * ユーザー登録APIエンドポイント
 * POST /api/auth/register
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストボディの取得
    const body = await req.json();
    
    // バリデーション
    if (!body.name || !body.email || !body.password || !body.passwordConfirm) {
      return NextResponse.json(
        { error: '名前、メールアドレス、パスワードとパスワード確認は必須です。' },
        { status: 400 }
      );
    }
    
    if (body.password !== body.passwordConfirm) {
      return NextResponse.json(
        { error: 'パスワードとパスワード確認が一致しません。' },
        { status: 400 }
      );
    }
    
    // パスワードの複雑さチェック
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(body.password)) {
      return NextResponse.json(
        { 
          error: 'パスワードは8文字以上で、大文字、小文字、数字、特殊文字をそれぞれ1つ以上含む必要があります。' 
        },
        { status: 400 }
      );
    }
    
    const registerData: RegisterRequest = {
      name: body.name,
      email: body.email,
      password: body.password,
      passwordConfirm: body.passwordConfirm,
    };
    
    // 認証サービスの初期化
    const authService = new AuthService();
    
    // ユーザー登録処理
    const { token, user } = await authService.register(registerData);
    
    // レスポンス生成
    const response = NextResponse.json({
      message: 'ユーザー登録に成功しました。',
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
    console.error('ユーザー登録エラー:', error);
    
    let statusCode = 500;
    let errorMessage = '登録処理中にエラーが発生しました。';
    
    // エラーの種類に応じたステータスコードとメッセージ
    if (error instanceof Error) {
      if (error.message.includes('既に登録されている')) {
        statusCode = 409; // Conflict
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }
    }
    
    // エラーレスポンス
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 