import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole, UserStatus, LoginRequest, RegisterRequest, AuthenticatedUser, TokenValidationResult } from '../models/user';
import { UserRepository } from '../repositories/userRepository';

/**
 * 認証サービスクラス
 * ユーザー認証に関する機能を提供
 */
export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private tokenExpiration: string;

  /**
   * コンストラクタ
   */
  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'insight-master-secret-key';
    this.tokenExpiration = process.env.JWT_EXPIRATION || '7d';
  }

  /**
   * ユーザーログイン処理
   * @param loginData ログインリクエストデータ
   * @returns トークンとユーザー情報
   */
  async login(loginData: LoginRequest): Promise<{ token: string; user: AuthenticatedUser }> {
    // メールアドレスでユーザーを検索
    const user = await this.userRepository.findByEmail(loginData.email);
    
    if (!user) {
      throw new Error('メールアドレスまたはパスワードが正しくありません。');
    }
    
    // 非アクティブなユーザーはログイン不可
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('このアカウントは現在無効になっています。管理者にお問い合わせください。');
    }
    
    // パスワードの検証
    const isPasswordValid = await this.userRepository.verifyPassword(user, loginData.password);
    
    if (!isPasswordValid) {
      throw new Error('メールアドレスまたはパスワードが正しくありません。');
    }
    
    // 最終ログイン日時を更新
    await this.userRepository.updateLastLogin(user._id);
    
    // 認証用ユーザー情報の作成
    const authUser: AuthenticatedUser = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio
    };
    
    // JWTトークンの生成
    const token = this.generateToken(authUser);
    
    return { token, user: authUser };
  }

  /**
   * ユーザー登録処理
   * @param registerData 登録リクエストデータ
   * @returns トークンとユーザー情報
   */
  async register(registerData: RegisterRequest): Promise<{ token: string; user: AuthenticatedUser }> {
    // パスワードの確認
    if (registerData.password !== registerData.passwordConfirm) {
      throw new Error('パスワードが一致しません。');
    }
    
    // メールアドレスが既に使用されているか確認
    const existingUser = await this.userRepository.findByEmail(registerData.email);
    
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています。');
    }
    
    // ユーザーの作成
    const user = await this.userRepository.create({
      email: registerData.email,
      name: registerData.name,
      password: registerData.password
    });
    
    // 認証用ユーザー情報の作成
    const authUser: AuthenticatedUser = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio
    };
    
    // JWTトークンの生成
    const token = this.generateToken(authUser);
    
    return { token, user: authUser };
  }

  /**
   * トークンの検証
   * @param token JWTトークン
   * @returns 検証結果
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      // トークンの検証
      const decoded = jwt.verify(token, this.jwtSecret) as { user: AuthenticatedUser };
      
      if (!decoded || !decoded.user) {
        return { isValid: false, error: '無効なトークンです。' };
      }
      
      // ユーザーが存在するか確認
      const user = await this.userRepository.findById(decoded.user.id);
      
      if (!user) {
        return { isValid: false, error: 'ユーザーが見つかりません。' };
      }
      
      // アクティブでないユーザーは認証不可
      if (user.status !== UserStatus.ACTIVE) {
        return { isValid: false, error: 'このアカウントは現在無効になっています。' };
      }
      
      // 認証成功
      return { 
        isValid: true, 
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          profileImageUrl: user.profileImageUrl,
          bio: user.bio
        }
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error 
          ? error.message 
          : '認証に失敗しました。再度ログインしてください。' 
      };
    }
  }

  /**
   * テスト用にJWTトークンを生成する
   * @param user 認証用ユーザー情報
   * @returns JWTトークン
   */
  generateTokenForTests(user: Partial<AuthenticatedUser>): string {
    return this.generateToken(user as AuthenticatedUser);
  }

  /**
   * JWTトークンの生成
   * @param user 認証用ユーザー情報
   * @returns JWTトークン
   */
  private generateToken(user: AuthenticatedUser): string {
    return jwt.sign({ user }, this.jwtSecret, {
      expiresIn: this.tokenExpiration
    });
  }
} 