import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/userRepository';
import bcrypt from 'bcrypt';

/**
 * パスワード変更API
 * PUT /api/users/me/password
 */
export async function PUT(req: NextRequest) {
  try {
    // ユーザーIDの取得
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }
    
    // リクエストボディの取得
    const { currentPassword, newPassword, confirmPassword } = await req.json();
    
    // 入力検証
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: '現在のパスワード、新しいパスワード、確認用パスワードはすべて必須です。' },
        { status: 400 }
      );
    }
    
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: '新しいパスワードと確認用パスワードが一致しません。' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上である必要があります。' },
        { status: 400 }
      );
    }
    
    // パスワードの複雑さチェック
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: 'パスワードは少なくとも1つの大文字、1つの小文字、1つの数字、1つの特殊文字を含む必要があります。' },
        { status: 400 }
      );
    }
    
    // ユーザーリポジトリの初期化
    const userRepository = new UserRepository();
    
    // ユーザーの取得
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません。' },
        { status: 404 }
      );
    }
    
    // 現在のパスワードを検証
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '現在のパスワードが正しくありません。' },
        { status: 400 }
      );
    }
    
    // 新しいパスワードをハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // パスワードを更新
    const updatedUser = await userRepository.update(userId, {
      password: hashedPassword,
      updatedAt: new Date()
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'パスワードの更新に失敗しました。' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'パスワードが正常に更新されました。' });
  } catch (error) {
    console.error('パスワード変更エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'パスワードの更新中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 