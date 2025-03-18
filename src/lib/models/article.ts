import { Document } from 'mongodb';

/**
 * 記事のステータス
 */
export enum ArticleStatus {
  DRAFT = 'draft',       // 下書き
  PUBLISHED = 'published', // 公開済み
  ARCHIVED = 'archived'  // アーカイブ済み
}

/**
 * 分析レベル
 */
export enum AnalysisLevel {
  BASIC = 'basic',       // 基本
  ADVANCED = 'advanced', // 高度
  EXPERT = 'expert'      // 専門家
}

/**
 * インサイトのカテゴリ
 */
export enum InsightCategory {
  MAIN_IDEA = 'main_idea',          // 主要な考え
  SUPPORTING_EVIDENCE = 'supporting_evidence', // 裏付け証拠
  IMPLICATION = 'implication',       // 意味合い
  COUNTERPOINT = 'counterpoint',     // 反論点
  LIMITATION = 'limitation',         // 限界
  RECOMMENDATION = 'recommendation',  // 推奨事項
  QUESTION = 'question'              // 疑問点
}

/**
 * インサイトインターフェース
 */
export interface Insight {
  id: string;
  content: string;
  category: InsightCategory;
  evidence?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AIが生成したインサイト
 */
export interface AiInsight extends Insight {
  confidence: number; // AIの確信度 (0-1)
}

/**
 * インサイト比較結果
 */
export interface InsightComparison {
  userInsight: Insight;
  aiInsight?: AiInsight;
  matchScore: number; // マッチスコア (0-1)
  feedback?: string;  // AIからのフィードバック
}

/**
 * 記事インターフェース
 */
export interface Article extends Document {
  _id: string;
  title: string;
  content: string;
  url?: string;
  author?: string;
  source?: string;
  publishedAt?: Date;
  imageUrl?: string;
  status: ArticleStatus;
  userId: string;
  insights: Insight[];
  aiInsights?: AiInsight[];
  tags?: string[];
  readingTime?: number; // 分単位の読書時間
  createdAt: Date;
  updatedAt: Date;
  analyzedAt?: Date;
}

/**
 * 記事作成リクエスト
 */
export interface CreateArticleRequest {
  title: string;
  content: string;
  url?: string;
  author?: string;
  source?: string;
  publishedAt?: Date;
  imageUrl?: string;
  status?: ArticleStatus;
  tags?: string[];
}

/**
 * 記事更新リクエスト
 */
export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  url?: string;
  author?: string;
  source?: string;
  publishedAt?: Date;
  imageUrl?: string;
  status?: ArticleStatus;
  tags?: string[];
  readingTime?: number; // 読書時間を追加
}

/**
 * インサイト作成リクエスト
 */
export interface CreateInsightRequest {
  content: string;
  category: InsightCategory;
  evidence?: string;
}

/**
 * 分析リクエスト
 */
export interface AnalyzeArticleRequest {
  articleId: string;
  level: AnalysisLevel;
} 