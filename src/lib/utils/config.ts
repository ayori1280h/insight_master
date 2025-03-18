import { logger } from './logger';

/**
 * 環境変数の型定義
 */
interface EnvironmentVariables {
  // サーバー設定
  NODE_ENV: string;
  PORT: number;
  
  // データベース設定
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  
  // JWT設定
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  
  // OpenAI設定
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
  OPENAI_MODEL: string;
  
  // ログ設定
  LOG_LEVEL: string;
}

/**
 * 環境変数のデフォルト値
 */
const defaultValues: Partial<EnvironmentVariables> = {
  NODE_ENV: 'development',
  PORT: 3000,
  MONGODB_URI: 'mongodb://localhost:27017',
  MONGODB_DB_NAME: 'insightmaster',
  JWT_EXPIRATION: '7d',
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  OPENAI_MODEL: 'gpt-4',
  LOG_LEVEL: 'info'
};

/**
 * 環境変数の必須チェック設定
 */
const requiredVariables: (keyof EnvironmentVariables)[] = [
  'JWT_SECRET',
  'MONGODB_URI',
  'MONGODB_DB_NAME'
];

/**
 * 環境変数管理クラス
 */
class Config {
  private config: Partial<EnvironmentVariables> = {};
  private initialized: boolean = false;
  
  /**
   * コンストラクタ
   */
  constructor() {
    this.loadEnvironmentVariables();
  }
  
  /**
   * 環境変数の読み込み
   */
  private loadEnvironmentVariables(): void {
    if (this.initialized) {
      return;
    }
    
    // デフォルト値をセット
    this.config = { ...defaultValues };
    
    // 環境変数から値を取得
    for (const key in defaultValues) {
      const envKey = key as keyof EnvironmentVariables;
      const envValue = process.env[envKey];
      
      if (envValue !== undefined) {
        // 型に応じて変換
        if (typeof defaultValues[envKey] === 'number') {
          this.config[envKey] = Number(envValue) as any;
        } else {
          this.config[envKey] = envValue as any;
        }
      }
    }
    
    // 必須環境変数のチェック
    const missingVariables = requiredVariables.filter(
      key => this.config[key] === undefined
    );
    
    if (missingVariables.length > 0) {
      const errorMessage = `必須環境変数が設定されていません: ${missingVariables.join(', ')}`;
      logger.error(errorMessage);
      
      if (process.env.NODE_ENV === 'production') {
        throw new Error(errorMessage);
      } else {
        logger.warn('開発環境のため処理を続行しますが、これらの変数は本番環境で必須です。');
      }
    }
    
    this.initialized = true;
    
    logger.info('環境変数を読み込みました。', { 
      environment: this.get('NODE_ENV'),
      database: this.get('MONGODB_DB_NAME')
    });
  }
  
  /**
   * 環境変数の取得
   * @param key 取得する環境変数キー
   * @param defaultValue デフォルト値
   * @returns 環境変数の値
   */
  get<K extends keyof EnvironmentVariables>(
    key: K, 
    defaultValue?: EnvironmentVariables[K]
  ): EnvironmentVariables[K] | undefined {
    return (this.config[key] !== undefined ? this.config[key] : defaultValue) as EnvironmentVariables[K] | undefined;
  }
  
  /**
   * 現在の環境が開発環境かどうかを判定
   * @returns 開発環境の場合はtrue
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }
  
  /**
   * 現在の環境が本番環境かどうかを判定
   * @returns 本番環境の場合はtrue
   */
  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }
  
  /**
   * 現在の環境がテスト環境かどうかを判定
   * @returns テスト環境の場合はtrue
   */
  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }
}

// エクスポートするコンフィグインスタンス
export const config = new Config(); 