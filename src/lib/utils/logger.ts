/**
 * ログレベルの定義
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * ログエントリーの型定義
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

/**
 * ロガークラス
 * アプリケーション全体でのログ記録を担当
 */
export class Logger {
  private static instance: Logger;
  private minLevel: LogLevel;
  
  /**
   * コンストラクタ
   * @param minLevel 最小ログレベル（これ以上のレベルのみログ出力）
   */
  private constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }
  
  /**
   * インスタンスの取得
   * @returns Loggerのインスタンス
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(
        (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
      );
    }
    return Logger.instance;
  }
  
  /**
   * デバッグログの出力
   * @param message ログメッセージ
   * @param context コンテキスト情報（オプション）
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  /**
   * 情報ログの出力
   * @param message ログメッセージ
   * @param context コンテキスト情報（オプション）
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  /**
   * 警告ログの出力
   * @param message ログメッセージ
   * @param context コンテキスト情報（オプション）
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  /**
   * エラーログの出力
   * @param message ログメッセージ
   * @param error エラーオブジェクト
   * @param context コンテキスト情報（オプション）
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    const errorContext = error 
      ? { 
          ...context, 
          error: { 
            message: error.message, 
            stack: error.stack,
            name: error.name 
          } 
        } 
      : context;
    
    this.log(LogLevel.ERROR, message, errorContext);
  }
  
  /**
   * ログのフォーマットと出力
   * @param level ログレベル
   * @param message ログメッセージ
   * @param context コンテキスト情報（オプション）
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // 最小レベル以上の場合のみログを出力
    if (!this.shouldLog(level)) {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(this.formatLogEntry(entry));
        break;
      case LogLevel.INFO:
        console.info(this.formatLogEntry(entry));
        break;
      case LogLevel.WARN:
        console.warn(this.formatLogEntry(entry));
        break;
      case LogLevel.ERROR:
        console.error(this.formatLogEntry(entry));
        break;
    }
  }
  
  /**
   * ログエントリーのフォーマット
   * @param entry ログエントリー
   * @returns フォーマットされたログ文字列
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context) {
      try {
        formattedMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
      } catch (error) {
        formattedMessage += `\nContext: [循環参照などでシリアライズできませんでした]`;
      }
    }
    
    return formattedMessage;
  }
  
  /**
   * 指定されたレベルのログを出力すべきかを判定
   * @param level 判定するログレベル
   * @returns 出力すべき場合はtrue
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minLevelIndex = levels.indexOf(this.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  }
}

// エクスポートするロガーインスタンス
export const logger = Logger.getInstance(); 