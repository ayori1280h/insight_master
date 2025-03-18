import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../services/authService';
import { User, UserRole, UserStatus } from '../models/user';
import { UserRepository } from '../repositories/userRepository';
import { ArticleRepository } from '../repositories/articleRepository';
import { DatabaseService } from '../services/databaseService';

/**
 * テストユーザー作成オプション
 */
interface CreateTestUserOptions {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * 認証リクエスト作成オプション
 */
interface CreateAuthenticatedRequestOptions {
  userId?: string;
  userRole?: UserRole;
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * テスト環境セットアップユーティリティ
 */
export class TestSetup {
  private static userRepository: UserRepository;
  private static articleRepository: ArticleRepository;
  private static authService: AuthService;
  private static dbService: DatabaseService;
  
  /**
   * インスタンス初期化（必要に応じて呼び出す）
   */
  static init(): void {
    if (!this.dbService) {
      this.dbService = DatabaseService.getInstance();
      this.userRepository = new UserRepository();
      this.articleRepository = new ArticleRepository();
      this.authService = new AuthService();
    }
  }
  
  /**
   * テストユーザーの作成
   * @param options ユーザー作成オプション
   * @returns 作成されたユーザー
   */
  static async createTestUser(options: CreateTestUserOptions = {}): Promise<User> {
    this.init();
    
    const userId = uuidv4();
    const defaultEmail = `test.user.${userId}@example.com`;
    
    const user = await this.userRepository.create({
      name: options.name || 'テストユーザー',
      email: options.email || defaultEmail,
      password: options.password || 'Test@12345',
      role: options.role || UserRole.USER,
      status: options.status || UserStatus.ACTIVE
    });
    
    return user;
  }
  
  /**
   * テストユーザー用のトークン生成
   * @param userId ユーザーID
   * @param userRole ユーザーロール
   * @returns 認証トークン
   */
  static async generateTokenForUser(userId: string, userRole: UserRole = UserRole.USER): Promise<string> {
    this.init();
    
    // ユーザー取得
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error(`ユーザーID ${userId} が見つかりません。`);
    }
    
    // トークン生成
    const authUser = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: userRole || user.role,
      status: user.status
    };
    
    return this.authService.generateTokenForTests(authUser);
  }
  
  /**
   * 認証済みリクエストの作成
   * @param options リクエスト作成オプション
   * @returns NextRequestオブジェクト
   */
  static async createAuthenticatedRequest(options: CreateAuthenticatedRequestOptions = {}): Promise<NextRequest> {
    this.init();
    
    const userId = options.userId || (await this.createTestUser())._id;
    const token = await this.generateTokenForUser(userId, options.userRole);
    
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    const url = options.url || 'http://localhost:3000/api/test';
    const method = options.method || 'GET';
    
    const reqInit: RequestInit = {
      method,
      headers
    };
    
    if (options.body) {
      reqInit.body = JSON.stringify(options.body);
    }
    
    const request = new NextRequest(new URL(url), reqInit);
    
    return request;
  }
  
  /**
   * データベースのクリーンアップ
   * テスト終了後に呼び出す
   */
  static async cleanup(): Promise<void> {
    this.init();
    
    // テスト終了後のクリーンアップ（テストデータの削除など）
    try {
      // テスト用コレクションのクリーンアップ処理を実装
      // 実際のアプリケーションに合わせて実装する
      
      // データベース接続のクローズ
      await this.dbService.disconnect();
    } catch (error) {
      console.error('テストクリーンアップエラー:', error);
    }
  }
} 