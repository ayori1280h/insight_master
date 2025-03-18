'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUser, ProfileUpdateInput } from '@/lib/hooks/useUser';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';

const ProfilePage = () => {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { 
    profile, 
    stats, 
    loading, 
    error, 
    success, 
    fetchProfile, 
    fetchStats, 
    updateProfile,
    clearMessages 
  } = useUser();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState<ProfileUpdateInput>({
    name: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // プロフィールと統計情報を取得
  useEffect(() => {
    if (authUser) {
      fetchProfile();
      fetchStats();
    }
  }, [authUser, fetchProfile, fetchStats]);

  // プロフィール情報をフォームにセット
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  // 編集モード切替
  const toggleEditMode = () => {
    if (isEditing) {
      // 編集モードを終了する場合は、元のプロフィール情報に戻す
      if (profile) {
        setProfileForm({
          name: profile.name,
          bio: profile.bio || '',
        });
      }
    }
    
    setIsEditing(!isEditing);
    clearMessages();
  };

  // フォーム入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value,
    }));
    clearMessages();
  };

  // プロフィール更新ハンドラ
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.name.trim()) {
      return; // 名前は必須
    }
    
    const updated = await updateProfile(profileForm);
    if (updated) {
      setIsEditing(false);
    }
  };

  if (authLoading || (loading && !profile)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">マイプロフィール</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="profile">プロフィール</TabsTrigger>
              <TabsTrigger value="security">セキュリティ</TabsTrigger>
              <TabsTrigger value="activity">アクティビティ</TabsTrigger>
              <TabsTrigger value="settings">設定</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>基本情報</CardTitle>
                    <CardDescription>プロフィール情報の確認と編集</CardDescription>
                  </div>
                  <Button 
                    variant={isEditing ? "outline" : "default"}
                    onClick={toggleEditMode}
                  >
                    {isEditing ? 'キャンセル' : '編集'}
                  </Button>
                </CardHeader>
                
                <CardContent className="pt-6">
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
                  
                  {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          名前 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={profileForm.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                          自己紹介
                        </label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profileForm.bio}
                          onChange={handleInputChange}
                          rows={4}
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button 
                          type="submit" 
                          disabled={loading || !profileForm.name.trim()}
                        >
                          {loading && <LoadingSpinner className="mr-2" size="small" />}
                          保存
                        </Button>
                      </div>
                    </form>
                  ) : profile ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">メールアドレス</h3>
                        <p className="mt-1">{profile.email}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">名前</h3>
                        <p className="mt-1">{profile.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">自己紹介</h3>
                        <p className="mt-1 whitespace-pre-wrap">{profile.bio || '未設定'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">アカウント作成日</h3>
                        <p className="mt-1">{formatDate(profile.createdAt)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">プロフィール情報の読み込み中にエラーが発生しました。</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {stats && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>統計情報</CardTitle>
                    <CardDescription>アクティビティの概要</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{stats.articlesCount}</p>
                        <p className="text-sm text-blue-800 mt-1">記事</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.insightsCount}</p>
                        <p className="text-sm text-green-800 mt-1">インサイト</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">{stats.tagsCount}</p>
                        <p className="text-sm text-purple-800 mt-1">使用タグ</p>
                      </div>
                    </div>
                    
                    {stats.lastActivity && (
                      <p className="text-sm text-gray-500 mt-4 text-center">
                        最終アクティビティ: {formatDate(stats.lastActivity)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>セキュリティ設定</CardTitle>
                  <CardDescription>パスワード変更などのセキュリティ設定</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <Button
                    onClick={() => router.push('/profile/password')}
                    className="w-full sm:w-auto"
                  >
                    パスワード変更
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>アカウント削除</CardTitle>
                  <CardDescription>アカウントを完全に削除します</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <Button 
                    variant="destructive"
                    onClick={() => router.push('/profile/delete-account')}
                    className="w-full sm:w-auto"
                  >
                    アカウント削除ページへ
                  </Button>
                </CardContent>
                
                <CardFooter className="border-t pt-6">
                  <p className="text-sm text-gray-500">
                    アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>アクティビティ履歴</CardTitle>
                  <CardDescription>最近の活動履歴</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-center py-6 text-gray-500">
                    アクティビティ履歴機能は現在開発中です。
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>アプリケーション設定</CardTitle>
                  <CardDescription>表示設定やその他の環境設定</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-center py-6 text-gray-500">
                    設定機能は現在開発中です。
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
