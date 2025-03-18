'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUser } from '@/lib/hooks/useUser';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DeleteAccountPage = () => {
  const router = useRouter();
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const { loading, error, success, requestAccountDeletion, clearMessages } = useUser();
  
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [validationError, setValidationError] = useState('');

  // パスワード入力変更ハンドラ
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setValidationError('');
    clearMessages();
  };

  // 確認テキスト入力変更ハンドラ
  const handleConfirmTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
    setValidationError('');
  };

  // アカウント削除ハンドラ
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!password) {
      setValidationError('パスワードを入力してください');
      return;
    }
    
    if (confirmText !== '削除を確認') {
      setValidationError('確認のテキストが正しくありません');
      return;
    }
    
    const deleted = await requestAccountDeletion(password);
    if (deleted) {
      // 削除リクエストが成功したら、5秒後にログアウトしてホームページにリダイレクト
      setTimeout(() => {
        logout();
        router.push('/');
      }, 5000);
    }
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
        <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <Link href="/profile" className="flex items-center text-blue-600 hover:text-blue-800 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            プロフィールに戻る
          </Link>
          
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800">アカウント削除</CardTitle>
              <CardDescription className="text-red-700">
                この操作は取り消せません。慎重に行ってください。
              </CardDescription>
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
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">アカウント削除の影響:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>すべての記事とインサイトが完全に削除されます</li>
                  <li>あなたのプロフィール情報が完全に削除されます</li>
                  <li>削除されたデータは復元できません</li>
                </ul>
              </div>
              
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    現在のパスワード <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700">
                    確認のため「削除を確認」と入力してください <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="confirmText"
                    type="text"
                    value={confirmText}
                    onChange={handleConfirmTextChange}
                    required
                  />
                </div>
                
                {validationError && (
                  <p className="text-sm text-red-600">{validationError}</p>
                )}
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="w-full"
                    disabled={loading || confirmText !== '削除を確認' || !password}
                  >
                    {loading && <LoadingSpinner className="mr-2" size="small" />}
                    アカウントを完全に削除する
                  </Button>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col items-start border-t pt-6">
              <p className="text-sm text-gray-500">
                アカウントを削除する代わりに、一時的にアプリケーションの使用を中止したい場合は、プロフィールページからアカウントを無効化することができます。
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DeleteAccountPage; 