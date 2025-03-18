import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/userRepository';

/**
 * ユーザープロフィール取得API
 * GET /api/users/me
 */
export async function GET(req: NextRequest) {
  try {
    // ユーザーIDの取得（認証ミドルウェアから）
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // リポジトリの初期化
    const userRepository = new UserRepository();

    // ユーザーの取得
    const user = await userRepository.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません。' },
        { status: 404 }
      );
    }

    // センシティブな情報を除外したユーザー情報を返す
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt
    };

    // レスポンス生成
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('ユーザープロフィール取得エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ユーザー情報の取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * ユーザープロフィール更新API
 * PUT /api/users/me
 */
export async function PUT(req: NextRequest) {
  try {
    // ユーザーIDの取得（認証ミドルウェアから）
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // リクエストボディの取得
    const { name, bio, profileImageUrl } = await req.json();

    // 更新データの検証
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: '名前は必須です。' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: '名前は50文字以内で入力してください。' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: '自己紹介は500文字以内で入力してください。' },
        { status: 400 }
      );
    }

    // リポジトリの初期化
    const userRepository = new UserRepository();

    // ユーザーの存在確認
    const existingUser = await userRepository.findById(userId);

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません。' },
        { status: 404 }
      );
    }

    // ユーザー情報の更新
    const updatedUser = await userRepository.update(userId, {
      name,
      bio: bio || '',
      profileImageUrl: profileImageUrl || existingUser.profileImageUrl,
      updatedAt: new Date()
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'プロフィールの更新に失敗しました。' },
        { status: 500 }
      );
    }

    // 更新後のプロフィール情報を返す
    const userProfile = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      profileImageUrl: updatedUser.profileImageUrl,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastLoginAt: updatedUser.lastLoginAt
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('ユーザープロフィール更新エラー:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'プロフィールの更新中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 