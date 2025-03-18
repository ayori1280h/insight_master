import { MongoClient, Db } from 'mongodb';

// MongoDB接続URI
// 実際の環境では環境変数から取得します
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insight-master';

// グローバルオブジェクトの型定義
declare global {
  var mongo: {
    client: MongoClient | null;
    db: Db | null;
    promise: Promise<{ client: MongoClient; db: Db }> | null;
  };
}

// グローバル変数の初期化
if (!global.mongo) {
  global.mongo = {
    client: null,
    db: null,
    promise: null,
  };
}

// データベース接続関数
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // 既に接続されている場合はその接続を返す
  if (global.mongo.client && global.mongo.db) {
    return {
      client: global.mongo.client,
      db: global.mongo.db,
    };
  }

  // 接続中の場合は既存のプロミスを返す
  if (!global.mongo.promise) {
    const client = new MongoClient(MONGODB_URI);
    global.mongo.promise = client.connect()
      .then((client) => {
        const db = client.db();
        return { client, db };
      })
      .catch((err) => {
        console.error('MongoDB接続エラー:', err);
        throw err;
      });
  }

  // 接続を待機し、グローバル変数に保存
  try {
    const { client, db } = await global.mongo.promise;
    global.mongo.client = client;
    global.mongo.db = db;
    return { client, db };
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    throw error;
  }
}

// データベースクライアントの取得
export function getDbClient() {
  if (!global.mongo.client) {
    throw new Error('データベースに接続されていません。connectToDatabase()を最初に呼び出してください。');
  }
  return global.mongo.client;
}

// データベースインスタンスの取得
export function getDb() {
  if (!global.mongo.db) {
    throw new Error('データベースに接続されていません。connectToDatabase()を最初に呼び出してください。');
  }
  return global.mongo.db;
} 