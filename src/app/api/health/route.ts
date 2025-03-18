import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/databaseService';

/**
 * ヘルスチェックAPI
 * GET /api/health
 */
export async function GET() {
  try {
    // データベース接続状態の確認
    const dbService = DatabaseService.getInstance();
    const dbConnected = dbService.isConnectedToDatabase();
    
    // 現在のシステム情報の取得
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || 'development'
    };
    
    // パフォーマンス指標の取得
    const performanceMetrics = {
      timestamp: new Date().toISOString(),
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024), // MB
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) // MB
      },
      cpu: process.cpuUsage()
    };
    
    // ヘルスステータスの決定
    const status = dbConnected ? 'healthy' : 'degraded';
    
    return NextResponse.json({
      status,
      version: process.env.APP_VERSION || '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbConnected ? 'connected' : 'disconnected'
        },
        api: {
          status: 'running'
        }
      },
      systemInfo,
      performanceMetrics
    });
  } catch (error) {
    console.error('ヘルスチェックエラー:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : '不明なエラーが発生しました。',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 