import { MongoClient, Db, Collection, Document, Filter, FindOptions, SortDirection, UpdateFilter, InsertOneResult, DeleteResult, FindCursor, OptionalUnlessRequiredId, UpdateResult, AggregationCursor, WithId, Sort } from 'mongodb';

/**
 * データベース接続とクエリを管理するサービスクラス
 * シングルトンパターンを使用
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  /**
   * プライベートコンストラクタ - シングルトンパターン
   */
  constructor() {
    // シングルトンパターンを厳密に適用しない
    // 代わりに同じインスタンスを返すgetInstance静的メソッドを提供
  }

  /**
   * インスタンスの取得
   * @returns DatabaseServiceのインスタンス
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * データベースへの接続
   * @returns 接続成功の場合はtrue
   */
  public async connect(): Promise<boolean> {
    if (this.isConnected && this.client && this.db) {
      return true;
    }

    try {
      const uri = process.env.MONGODB_URI;
      const dbName = process.env.MONGODB_DB_NAME;

      if (!uri) {
        throw new Error('MongoDB URI が設定されていません。');
      }

      if (!dbName) {
        throw new Error('MongoDB データベース名が設定されていません。');
      }

      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;

      console.log('データベースに接続しました。');
      return true;
    } catch (error) {
      console.error('データベース接続エラー:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * データベース接続の切断
   */
  public async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      this.client = null;
      this.db = null;
      console.log('データベース接続を閉じました。');
    }
  }

  /**
   * データベースオブジェクトの取得
   * @returns Dbオブジェクト
   */
  public getDatabase(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error('データベースに接続されていません。connect()を先に呼び出してください。');
    }
    return this.db;
  }

  /**
   * 接続状態の確認
   * @returns 接続中の場合はtrue
   */
  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  /**
   * 接続のリセット（接続が切れた場合の再接続用）
   */
  public async resetConnection(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }

  /**
   * コレクションの取得
   * @param collectionName コレクション名
   * @returns コレクションオブジェクト
   */
  private getCollection<T extends Document>(collectionName: string): Collection<T> {
    if (!this.db || !this.isConnected) {
      throw new Error('データベースに接続されていません。');
    }
    return this.db.collection<T>(collectionName);
  }

  /**
   * ドキュメントの挿入
   * @param collectionName コレクション名
   * @param document 挿入するドキュメント
   * @returns 挿入結果
   */
  async insertOne<T extends Document>(collectionName: string, document: OptionalUnlessRequiredId<T>): Promise<InsertOneResult<T>> {
    await this.connect();
    const collection = this.getCollection<T>(collectionName);
    return await collection.insertOne(document);
  }

  /**
   * ドキュメントの更新
   * @param collectionName コレクション名
   * @param filter フィルタ
   * @param update 更新内容
   * @returns 更新結果
   */
  async updateOne<T extends Document>(collectionName: string, filter: Filter<T>, update: UpdateFilter<T> | Partial<T>): Promise<Document | null> {
    await this.connect();
    const collection = this.getCollection<T>(collectionName);
    const result = await collection.findOneAndUpdate(
      filter, 
      update, 
      { returnDocument: 'after' }
    );
    return result;
  }

  /**
   * ドキュメントの削除
   * @param collectionName コレクション名
   * @param filter フィルタ
   * @returns 削除結果
   */
  async deleteOne<T extends Document>(collectionName: string, filter: Filter<T>): Promise<DeleteResult> {
    await this.connect();
    const collection = this.getCollection<T>(collectionName);
    return await collection.deleteOne(filter);
  }

  /**
   * ドキュメントの検索
   * @param collectionName コレクション名
   * @param filter フィルタ
   * @param options 検索オプション
   * @returns ドキュメントの配列
   */
  async find<T extends Document>(
    collectionName: string, 
    filter: Filter<T>, 
    options?: { 
      limit?: number; 
      skip?: number; 
      sort?: Record<string, number>;
    }
  ): Promise<T[]> {
    await this.connect();
    const collection = this.getCollection<T>(collectionName);
    let cursor = collection.find(filter);

    if (options?.sort) {
      cursor = cursor.sort(options.sort);
    }

    if (options?.skip) {
      cursor = cursor.skip(options.skip);
    }

    if (options?.limit) {
      cursor = cursor.limit(options.limit);
    }

    return await cursor.toArray();
  }

  /**
   * ドキュメントの検索（一件）
   * @param collectionName コレクション名
   * @param filter フィルタ
   * @returns ドキュメント
   */
  async findOne<T extends Document>(collectionName: string, filter: Filter<T>): Promise<T | null> {
    await this.connect();
    const collection = this.getCollection<T>(collectionName);
    return await collection.findOne(filter);
  }

  /**
   * ドキュメント数の取得
   * @param collectionName コレクション名
   * @param filter フィルタ
   * @returns ドキュメント数
   */
  async count<T extends Document>(collectionName: string, filter: Filter<T>): Promise<number> {
    await this.connect();
    const collection = this.getCollection<T>(collectionName);
    return await collection.countDocuments(filter);
  }

  /**
   * 集計パイプラインの実行
   * @param collectionName コレクション名
   * @param pipeline 集計パイプライン
   * @returns 集計結果
   */
  async aggregate<T extends Document>(collectionName: string, pipeline: Document[]): Promise<Document[]> {
    await this.connect();
    const collection = this.getCollection<T>(collectionName);
    return await collection.aggregate(pipeline).toArray();
  }
} 