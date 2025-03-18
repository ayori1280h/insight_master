import { Collection, Db, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../models/user';
import { DatabaseService } from '../services/databaseService';

/**
 * ユーザーリポジトリクラス
 * ユーザー関連のデータベース操作を担当
 */
export class UserRepository {
  private collection: Collection<User>;
  private db: Db;

  /**
   * コンストラクタ
   */
  constructor() {
    const dbService = DatabaseService.getInstance();
    this.db = dbService.getDatabase();
    this.collection = this.db.collection<User>('users');
  }

  /**
   * メールアドレスでユーザーを検索
   * @param email メールアドレス
   * @returns ユーザーオブジェクトまたはnull
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email });
  }

  /**
   * IDでユーザーを検索
   * @param id ユーザーID
   * @returns ユーザーオブジェクトまたはnull
   */
  async findById(id: string): Promise<User | null> {
    return this.collection.findOne({ _id: id });
  }

  /**
   * 新規ユーザーの作成
   * @param userData ユーザーデータ
   * @returns 作成されたユーザー
   */
  async create(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const now = new Date();
    const newUser: User = {
      _id: uuidv4(),
      name: userData.name,
      email: userData.email,
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.insertOne(newUser);
    return newUser;
  }

  /**
   * ユーザー情報の更新
   * @param id ユーザーID
   * @param userData 更新するユーザーデータ
   * @returns 更新されたユーザー
   */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    // パスワードが含まれている場合はハッシュ化
    if (userData.passwordHash && typeof userData.passwordHash === 'string') {
      const salt = await bcrypt.genSalt(10);
      userData.passwordHash = await bcrypt.hash(userData.passwordHash, salt);
    }

    // 更新日時の設定
    userData.updatedAt = new Date();

    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: userData },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * 最終ログイン日時の更新
   * @param id ユーザーID
   * @returns 更新されたユーザー
   */
  async updateLastLogin(id: string): Promise<User | null> {
    const now = new Date();
    return this.update(id, { lastLoginAt: now });
  }

  /**
   * パスワード検証
   * @param user ユーザーオブジェクト
   * @param password 平文パスワード
   * @returns 検証結果
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * ユーザーアカウントの削除（論理削除）
   * @param id ユーザーID
   * @returns 削除結果
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id },
      { $set: { status: UserStatus.INACTIVE, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * ユーザーアカウントの完全削除（物理削除）
   * @param id ユーザーID
   * @returns 削除結果
   */
  async permanentDelete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * ユーザー一覧の取得
   * @param limit 取得件数
   * @param skip スキップ件数
   * @returns ユーザー一覧
   */
  async findAll(limit = 10, skip = 0): Promise<User[]> {
    return this.collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * アクティブなユーザー数の取得
   * @returns アクティブなユーザー数
   */
  async countActive(): Promise<number> {
    return this.collection.countDocuments({ status: UserStatus.ACTIVE });
  }
} 