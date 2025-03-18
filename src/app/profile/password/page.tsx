'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUser, PasswordChangeInput } from '@/lib/hooks/useUser';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PasswordChangePage = () => {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { loading, error, success, changePassword, clearMessages } = useUser();
  
  const [passwordForm, setPasswordForm] = useState<PasswordChangeInput>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // フォーム入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 入力時にエラーをクリア
    setValidationErrors(prev => ({
      ...prev,
      [name]: undefined,
    }));
    clearMessages();
  };

  // パスワード検証
  const validateForm = (): boolean => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = '現在のパスワードを入力してください';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = '新しいパスワードを入力してください';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'パスワードは8文字以上である必要があります';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '確認用パスワードを入力してください';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '新しいパスワードと確認用パスワードが一致しません';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // パスワード変更ハンドラ
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const changed = await changePassword(passwordForm);
    if (changed) {
      // 成功したらフォームをリセット
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // 3秒後にプロフィールページに戻る
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
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
            <CardHeader>
              <CardTitle>パスワード変更</CardTitle>
              <CardDescription>アカウントのパスワードを変更します</CardDescription>
            </CardHeader>
            
            <CardContent>
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
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    現在のパスワード <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                  {validationErrors.currentPassword && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.currentPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    新しいパスワード <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handleInputChange}
                    required
                  />
                  {validationErrors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.newPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    新しいパスワード（確認） <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <LoadingSpinner className="mr-2" size="small" />}
                    パスワードを変更
                  </Button>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col items-start border-t pt-6">
              <p className="text-sm text-gray-500 mb-2">パスワードの要件:</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
                <li>8文字以上であること</li>
                <li>大文字と小文字を含むことをお勧めします</li>
                <li>数字を含むことをお勧めします</li>
                <li>特殊文字（!@#$%^&*）を含むことをお勧めします</li>
              </ul>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PasswordChangePage; 