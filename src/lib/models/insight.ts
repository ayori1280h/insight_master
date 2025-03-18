// 洞察ポイントのカテゴリー定義
export enum InsightCategory {
  HIDDEN_ASSUMPTION = "隠れた前提条件",
  CAUSALITY = "因果関係",
  CONTRADICTION = "矛盾点",
  DATA_INTERPRETATION = "データの解釈方法",
  AUTHOR_BIAS = "著者のバイアス",
  INDUSTRY_TREND = "業界トレンドとの関連性"
}

// 洞察ポイントのインターフェース定義
export interface InsightPoint {
  id: string;
  articleId: string;
  category: InsightCategory;
  title: string;
  description: string;
  textPosition?: {
    startIndex: number;
    endIndex: number;
  };
  relatedText?: string;
  importance: number; // 1-5のスケール
  createdAt: Date;
}

// 洞察分析結果のインターフェース定義
export interface InsightAnalysis {
  id: string;
  articleId: string;
  insights: InsightPoint[];
  summary: string;
  analysisLevel: AnalysisLevel;
  createdAt: Date;
}

// 分析レベルの定義
export enum AnalysisLevel {
  BEGINNER = "初級",
  INTERMEDIATE = "中級",
  ADVANCED = "上級"
}

// ユーザーの洞察ポイントのインターフェース定義
export interface UserInsight {
  id: string;
  userId: string;
  articleId: string;
  category: InsightCategory;
  description: string;
  textPosition?: {
    startIndex: number;
    endIndex: number;
  };
  relatedText?: string;
  createdAt: Date;
}

// ユーザーの洞察分析結果のインターフェース定義
export interface UserInsightAnalysis {
  id: string;
  userId: string;
  articleId: string;
  userInsights: UserInsight[];
  aiInsights: InsightPoint[];
  matchScore: number; // 0-100のスケール
  missedInsights: InsightPoint[];
  extraInsights: UserInsight[];
  feedback: string;
  createdAt: Date;
}

// 洞察カテゴリーの説明
export const InsightCategoryDescription: Record<InsightCategory, string> = {
  [InsightCategory.HIDDEN_ASSUMPTION]: "文章中で明示的に述べられていないが、議論の前提となっている仮定や条件",
  [InsightCategory.CAUSALITY]: "事象間の因果関係の主張とその根拠の妥当性",
  [InsightCategory.CONTRADICTION]: "文章内の矛盾点や一貫性のない主張",
  [InsightCategory.DATA_INTERPRETATION]: "データや統計の解釈方法とその妥当性",
  [InsightCategory.AUTHOR_BIAS]: "著者の視点や立場によるバイアス",
  [InsightCategory.INDUSTRY_TREND]: "業界や分野の動向との関連性"
};

// 洞察カテゴリーのアイコン（Lucide Reactアイコン名）
export const InsightCategoryIcon: Record<InsightCategory, string> = {
  [InsightCategory.HIDDEN_ASSUMPTION]: "Eye",
  [InsightCategory.CAUSALITY]: "GitFork",
  [InsightCategory.CONTRADICTION]: "AlertTriangle",
  [InsightCategory.DATA_INTERPRETATION]: "BarChart",
  [InsightCategory.AUTHOR_BIAS]: "UserCheck",
  [InsightCategory.INDUSTRY_TREND]: "TrendingUp"
};

// 洞察カテゴリーの色
export const InsightCategoryColor: Record<InsightCategory, string> = {
  [InsightCategory.HIDDEN_ASSUMPTION]: "blue",
  [InsightCategory.CAUSALITY]: "green",
  [InsightCategory.CONTRADICTION]: "red",
  [InsightCategory.DATA_INTERPRETATION]: "purple",
  [InsightCategory.AUTHOR_BIAS]: "yellow",
  [InsightCategory.INDUSTRY_TREND]: "indigo"
};
