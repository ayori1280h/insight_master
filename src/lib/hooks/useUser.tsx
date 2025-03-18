import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/utils';

// ユーザー情報の型定義
export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// プロフィール更新のための型定義
export interface ProfileUpdateInput {
  name: string;
  bio?: string;
}

// パスワード変更のための型定義
export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ユーザー統計情報の型定義
export interface UserStats {
  articlesCount: number;
  insightsCount: number;
  tagsCount: number;
  lastActivity?: string;
}

// ダッシュボード表示用の統計情報の型定義
export interface UserStatistics {
  articleCount: number;
  insightCount: number;
  aiGeneratedCount: number;
  uniqueTagCount: number;
  lastActivityDate?: string;
}

/**
 * ユーザー情報管理用カスタムフック
 */
export function useUser() {
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * ユーザープロフィールを取得
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ user: User }>('/api/users/profile');
      setProfile(data.user);
      return data.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィールの取得中にエラーが発生しました');
      console.error('プロフィール取得エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ユーザー統計情報を取得
   */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth<{ stats: UserStats }>('/api/users/stats');
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計情報の取得中にエラーが発生しました');
      console.error('統計情報取得エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ダッシュボード用の統計情報を取得
   */
  const fetchUserStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 通常は別のAPIエンドポイントから取得するが、モックとして簡易的に実装
      await fetchStats();
      
      // モックデータ（実際の実装では削除）
      const mockStats: UserStatistics = {
        articleCount: Math.floor(Math.random() * 50) + 10,
        insightCount: Math.floor(Math.random() * 100) + 30,
        aiGeneratedCount: Math.floor(Math.random() * 30) + 5,
        uniqueTagCount: Math.floor(Math.random() * 40) + 15,
        lastActivityDate: new Date().toISOString()
      };
      
      setStatistics(mockStats);
      return mockStats;
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計情報の取得中にエラーが発生しました');
      console.error('統計情報取得エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  /**
   * プロフィールを更新
   */
  const updateProfile = useCallback(async (profileData: ProfileUpdateInput) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const data = await fetchWithAuth<{ user: User }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      setProfile(data.user);
      setSuccess('プロフィールが正常に更新されました');
      
      return data.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィールの更新中にエラーが発生しました');
      console.error('プロフィール更新エラー:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * パスワードを変更
   */
  const changePassword = useCallback(async (passwordData: PasswordChangeInput) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // 入力検証
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません');
      setLoading(false);
      return false;
    }
    
    try {
      await fetchWithAuth('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      setSuccess('パスワードが正常に変更されました');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードの変更中にエラーが発生しました');
      console.error('パスワード変更エラー:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * アカウント削除リクエスト
   */
  const requestAccountDeletion = useCallback(async (password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await fetchWithAuth('/api/users/delete-account', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      
      setSuccess('アカウント削除リクエストが送信されました。確認メールをご確認ください。');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アカウント削除リクエスト中にエラーが発生しました');
      console.error('アカウント削除リクエストエラー:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * エラーと成功メッセージをクリア
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    profile,
    stats,
    statistics,
    loading,
    error,
    success,
    fetchProfile,
    fetchStats,
    fetchUserStatistics,
    updateProfile,
    changePassword,
    requestAccountDeletion,
    clearMessages,
  };
} 