'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 設定のタイプ定義
interface UserSettings {
  emailNotifications: boolean;
  articleSummaryNotifications: boolean;
  weeklyDigest: boolean;
  darkMode: boolean;
  autoGenerateInsights: boolean;
}

// モックデータ。実際には API から取得する
const defaultSettings: UserSettings = {
  emailNotifications: true,
  articleSummaryNotifications: true,
  weeklyDigest: false,
  darkMode: false,
  autoGenerateInsights: true,
};

const SettingsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 設定の読み込み
  useEffect(() => {
    if (user) {
      // モックデータ。実際には API から取得する
      // 以下は localStorage からの読み込みをシミュレート
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('設定の読み込みに失敗しました', e);
          setSettings(defaultSettings);
        }
      }
    }
  }, [user]);

  // 設定の保存
  const saveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // API 呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 設定を localStorage に保存（モックとして）
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // ダークモード設定を適用（実際の実装では Theme Provider を使用）
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      setSuccess('設定が保存されました');
    } catch (err) {
      setError('設定の保存に失敗しました。もう一度お試しください。');
      console.error('設定の保存エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 設定変更ハンドラ
  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSuccess('');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">設定</h1>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ダッシュボードに戻る
            </Link>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* 通知設定 */}
            <Card>
              <CardHeader>
                <CardTitle>通知設定</CardTitle>
                <CardDescription>
                  アプリケーションからの通知設定を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Eメール通知</h3>
                    <p className="text-sm text-gray-500">
                      アプリケーションの重要な更新に関するEメールを受け取ります
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">記事要約通知</h3>
                    <p className="text-sm text-gray-500">
                      保存した記事の自動要約が生成されたときに通知を受け取ります
                    </p>
                  </div>
                  <Switch
                    checked={settings.articleSummaryNotifications}
                    onCheckedChange={(checked) => handleSettingChange('articleSummaryNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">週間ダイジェスト</h3>
                    <p className="text-sm text-gray-500">
                      毎週、保存した記事と生成されたインサイトのまとめを受け取ります
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 表示設定 */}
            <Card>
              <CardHeader>
                <CardTitle>表示設定</CardTitle>
                <CardDescription>
                  アプリケーションの外観と動作をカスタマイズします
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">ダークモード</h3>
                    <p className="text-sm text-gray-500">
                      アプリケーション全体でダークモードを有効にします
                    </p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI設定 */}
            <Card>
              <CardHeader>
                <CardTitle>AI設定</CardTitle>
                <CardDescription>
                  AI機能の挙動をカスタマイズします
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">自動インサイト生成</h3>
                    <p className="text-sm text-gray-500">
                      新しい記事を保存したときに自動的にAIインサイトを生成します
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoGenerateInsights}
                    onCheckedChange={(checked) => handleSettingChange('autoGenerateInsights', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={saveSettings} 
                disabled={loading}
              >
                {loading && <LoadingSpinner className="mr-2" size="small" />}
                設定を保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage; 