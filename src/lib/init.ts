import { DatabaseService } from './services/databaseService';

/**
 * アプリケーション初期化プロセス
 */
class AppInitializer {
  private static instance: AppInitializer;
  private isInitialized: boolean = false;

  /**
   * プライベートコンストラクタ - シングルトンパターン
   */
  private constructor() {}

  /**
   * インスタンスの取得
   * @returns AppInitializerのインスタンス
   */
  public static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  /**
   * アプリケーション初期化
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('アプリケーションは既に初期化されています。');
      return;
    }

    console.log('アプリケーション初期化を開始します...');

    try {
      // データベース接続の初期化
      await this.initializeDatabase();

      this.isInitialized = true;
      console.log('アプリケーション初期化が完了しました。');
    } catch (error) {
      console.error('アプリケーション初期化に失敗しました:', error);
      throw error;
    }
  }

  /**
   * データベース接続の初期化
   */
  private async initializeDatabase(): Promise<void> {
    console.log('データベース接続を初期化しています...');
    const dbService = DatabaseService.getInstance();
    
    const connected = await dbService.connect();
    
    if (!connected) {
      throw new Error('データベースへの接続に失敗しました。');
    }
    
    console.log('データベース接続が正常に初期化されました。');
  }
}

// エクスポートするインスタンス
export const appInitializer = AppInitializer.getInstance(); 