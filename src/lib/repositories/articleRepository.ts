import { Collection, Db, Filter, UpdateFilter } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import {
  Article,
  ArticleStatus,
  CreateArticleRequest,
  UpdateArticleRequest,
  Insight,
  CreateInsightRequest,
  InsightCategory
} from '../models/article';
import { DatabaseService } from '../services/databaseService';

/**
 * 記事リポジトリクラス
 * 記事関連のデータベース操作を担当
 */
export class ArticleRepository {
  private collection: Collection<Article>;
  private db: Db;

  /**
   * コンストラクタ
   */
  constructor() {
    const dbService = DatabaseService.getInstance();
    this.db = dbService.getDatabase();
    this.collection = this.db.collection<Article>('articles');
  }

  /**
   * 記事の作成
   * @param userId ユーザーID
   * @param articleData 記事データ
   * @returns 作成された記事
   */
  async create(userId: string, articleData: CreateArticleRequest): Promise<Article> {
    const now = new Date();
    
    const newArticle: Article = {
      _id: uuidv4(),
      title: articleData.title,
      content: articleData.content,
      url: articleData.url,
      author: articleData.author,
      source: articleData.source,
      publishedAt: articleData.publishedAt,
      imageUrl: articleData.imageUrl,
      status: articleData.status || ArticleStatus.DRAFT,
      userId: userId,
      insights: [],
      tags: articleData.tags || [],
      readingTime: this.calculateReadingTime(articleData.content),
      createdAt: now,
      updatedAt: now
    };

    await this.collection.insertOne(newArticle);
    return newArticle;
  }

  /**
   * 記事の更新
   * @param id 記事ID
   * @param userId ユーザーID
   * @param articleData 更新する記事データ
   * @returns 更新された記事
   */
  async update(id: string, userId: string, articleData: UpdateArticleRequest): Promise<Article | null> {
    // 読書時間の計算（コンテンツが更新された場合）
    if (articleData.content) {
      articleData.readingTime = this.calculateReadingTime(articleData.content);
    }

    // 更新日時の設定
    const updatedData = {
      ...articleData,
      updatedAt: new Date()
    };

    const result = await this.collection.findOneAndUpdate(
      { _id: id, userId },
      { $set: updatedData },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * 記事の取得
   * @param id 記事ID
   * @returns 記事データ
   */
  async findById(id: string): Promise<Article | null> {
    return this.collection.findOne({ _id: id });
  }

  /**
   * ユーザーの記事を取得
   * @param userId ユーザーID
   * @param status 記事ステータス（オプション）
   * @param limit 取得件数
   * @param skip スキップ件数
   * @returns 記事一覧
   */
  async findByUserId(
    userId: string,
    status?: ArticleStatus,
    limit = 10,
    skip = 0
  ): Promise<Article[]> {
    const query: Filter<Article> = { userId };
    
    if (status) {
      query.status = status;
    }

    return this.collection
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * ユーザーの記事数を取得
   * @param userId ユーザーID
   * @param status 記事ステータス（オプション）
   * @returns 記事数
   */
  async countByUserId(userId: string, status?: ArticleStatus): Promise<number> {
    const query: Filter<Article> = { userId };
    
    if (status) {
      query.status = status;
    }

    return this.collection.countDocuments(query);
  }

  /**
   * 記事の削除
   * @param id 記事ID
   * @param userId ユーザーID
   * @returns 削除結果
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  /**
   * 記事ステータスの更新
   * @param id 記事ID
   * @param userId ユーザーID
   * @param status 新しいステータス
   * @returns 更新された記事
   */
  async updateStatus(id: string, userId: string, status: ArticleStatus): Promise<Article | null> {
    return this.update(id, userId, { status });
  }

  /**
   * インサイトの追加
   * @param articleId 記事ID
   * @param userId ユーザーID
   * @param insightData インサイトデータ
   * @returns 更新された記事
   */
  async addInsight(
    articleId: string,
    userId: string,
    insightData: CreateInsightRequest
  ): Promise<Article | null> {
    const now = new Date();
    
    const newInsight: Insight = {
      id: uuidv4(),
      content: insightData.content,
      category: insightData.category,
      evidence: insightData.evidence,
      createdAt: now,
      updatedAt: now
    };

    const result = await this.collection.findOneAndUpdate(
      { _id: articleId, userId },
      { 
        $push: { insights: newInsight as any },
        $set: { updatedAt: now }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * インサイトの更新
   * @param articleId 記事ID
   * @param userId ユーザーID
   * @param insightId インサイトID
   * @param insightData 更新するインサイトデータ
   * @returns 更新された記事
   */
  async updateInsight(
    articleId: string,
    userId: string,
    insightId: string,
    insightData: Partial<CreateInsightRequest>
  ): Promise<Article | null> {
    const now = new Date();
    
    // 更新するフィールドを準備
    const updateFields: Record<string, any> = {
      'updatedAt': now,
      'insights.$.updatedAt': now
    };
    
    if (insightData.content !== undefined) {
      updateFields['insights.$.content'] = insightData.content;
    }
    
    if (insightData.category !== undefined) {
      updateFields['insights.$.category'] = insightData.category;
    }
    
    if (insightData.evidence !== undefined) {
      updateFields['insights.$.evidence'] = insightData.evidence;
    }

    const result = await this.collection.findOneAndUpdate(
      { 
        _id: articleId, 
        userId,
        'insights.id': insightId
      },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * インサイトの削除
   * @param articleId 記事ID
   * @param userId ユーザーID
   * @param insightId インサイトID
   * @returns 更新された記事
   */
  async deleteInsight(
    articleId: string,
    userId: string,
    insightId: string
  ): Promise<Article | null> {
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      { _id: articleId, userId },
      { 
        $pull: { insights: { id: insightId } as any },
        $set: { updatedAt: now }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * 記事の分析日時を更新
   * @param articleId 記事ID
   * @param userId ユーザーID
   * @returns 更新された記事
   */
  async updateAnalyzedAt(articleId: string, userId: string): Promise<Article | null> {
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      { _id: articleId, userId },
      { $set: { analyzedAt: now, updatedAt: now } },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * AIインサイトの保存
   * @param articleId 記事ID
   * @param userId ユーザーID
   * @param aiInsights AIインサイトの配列
   * @returns 更新された記事
   */
  async saveAiInsights(articleId: string, userId: string, aiInsights: any[]): Promise<Article | null> {
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      { _id: articleId, userId },
      { 
        $set: { 
          aiInsights,
          analyzedAt: now,
          updatedAt: now
        } 
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * タグでの記事検索
   * @param userId ユーザーID
   * @param tag タグ
   * @param limit 取得件数
   * @param skip スキップ件数
   * @returns 記事一覧
   */
  async findByTag(userId: string, tag: string, limit = 10, skip = 0): Promise<Article[]> {
    return this.collection
      .find({ userId, tags: tag })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * キーワードでの記事検索
   * @param userId ユーザーID
   * @param keyword 検索キーワード
   * @param limit 取得件数
   * @param skip スキップ件数
   * @returns 記事一覧
   */
  async search(userId: string, keyword: string, limit = 10, skip = 0): Promise<Article[]> {
    const searchRegex = new RegExp(keyword, 'i');
    
    return this.collection
      .find({
        userId,
        $or: [
          { title: { $regex: searchRegex } },
          { content: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } }
        ]
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * 読書時間の計算（単純な実装）
   * @param content 記事の内容
   * @returns 読書時間（分）
   */
  private calculateReadingTime(content: string): number {
    // 平均読書速度: 1分あたり約200語
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // 最低1分
    return Math.max(1, readingTime);
  }

  /**
   * ユーザーIDに基づいて記事を検索します
   * @param userId ユーザーID
   * @param options 検索オプション
   */
  async findByUserId(userId: string, options?: { limit?: number; skip?: number; sort?: Record<string, number> }): Promise<Article[]> {
    try {
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options || {};
      
      const articles = await this.db.find(
        this.collection,
        { userId },
        { limit, skip, sort }
      );
      
      return articles as Article[];
    } catch (error) {
      console.error('記事検索エラー:', error);
      return [];
    }
  }

  /**
   * ユーザーIDに基づいて記事の数を取得します
   * @param userId ユーザーID
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      const count = await this.db.count(this.collection, { userId });
      return count;
    } catch (error) {
      console.error('記事カウントエラー:', error);
      return 0;
    }
  }

  /**
   * ユーザーのインサイト総数を取得します
   * @param userId ユーザーID
   */
  async countInsightsByUserId(userId: string): Promise<number> {
    try {
      const pipeline = [
        { $match: { userId } },
        { $project: { insightCount: { $size: { $ifNull: ['$insights', []] } } } },
        { $group: { _id: null, totalInsights: { $sum: '$insightCount' } } }
      ];
      
      const result = await this.db.aggregate(this.collection, pipeline);
      
      return result.length > 0 ? result[0].totalInsights : 0;
    } catch (error) {
      console.error('インサイトカウントエラー:', error);
      return 0;
    }
  }

  /**
   * ユーザーの記事カテゴリー別集計を取得します
   * @param userId ユーザーID
   */
  async getArticleCategoryCountsByUserId(userId: string): Promise<Record<string, number>> {
    try {
      const pipeline = [
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ];
      
      const result = await this.db.aggregate(this.collection, pipeline);
      
      return result.reduce((acc: Record<string, number>, curr) => {
        acc[curr._id || 'uncategorized'] = curr.count;
        return acc;
      }, {});
    } catch (error) {
      console.error('記事カテゴリー集計エラー:', error);
      return {};
    }
  }

  /**
   * ユーザーのインサイトカテゴリー別集計を取得します
   * @param userId ユーザーID
   */
  async getInsightCategoryCountsByUserId(userId: string): Promise<Record<string, number>> {
    try {
      const pipeline = [
        { $match: { userId } },
        { $unwind: { path: '$insights', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$insights.category', count: { $sum: 1 } } }
      ];
      
      const result = await this.db.aggregate(this.collection, pipeline);
      
      return result.reduce((acc: Record<string, number>, curr) => {
        acc[curr._id || 'uncategorized'] = curr.count;
        return acc;
      }, {});
    } catch (error) {
      console.error('インサイトカテゴリー集計エラー:', error);
      return {};
    }
  }

  /**
   * 指定期間のユーザーアクティビティを取得します
   * @param userId ユーザーID
   * @param startDate 開始日
   */
  async getRecentActivityByUserId(userId: string, startDate: Date): Promise<any> {
    try {
      // 記事作成アクティビティ
      const articleCreationPipeline = [
        { 
          $match: { 
            userId,
            createdAt: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ];
      
      // インサイト追加アクティビティ
      const insightAdditionPipeline = [
        { $match: { userId } },
        { $unwind: { path: '$insights', preserveNullAndEmptyArrays: false } },
        { 
          $match: { 
            'insights.createdAt': { $gte: startDate } 
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: '%Y-%m-%d', date: '$insights.createdAt' } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ];
      
      const [articleActivity, insightActivity] = await Promise.all([
        this.db.aggregate(this.collection, articleCreationPipeline),
        this.db.aggregate(this.collection, insightAdditionPipeline)
      ]);
      
      return {
        articleActivity: articleActivity.map(item => ({
          date: item._id,
          count: item.count
        })),
        insightActivity: insightActivity.map(item => ({
          date: item._id,
          count: item.count
        }))
      };
    } catch (error) {
      console.error('アクティビティ取得エラー:', error);
      return {
        articleActivity: [],
        insightActivity: []
      };
    }
  }
} 