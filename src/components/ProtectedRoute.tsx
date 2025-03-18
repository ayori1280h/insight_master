import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import LoadingSpinner from './ui/LoadingSpinner';
import { UserRole } from '@/lib/models/user';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * 未認証ユーザーはログインページにリダイレクトされます
 */
const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 認証情報の読み込みが完了したら
    if (!loading) {
      // ユーザーが存在しない場合はログインページへリダイレクト
      if (!user) {
        router.push('/login');
        return;
      }

      // 管理者専用ルートで、ユーザーが管理者でない場合はダッシュボードへリダイレクト
      if (adminOnly && user.role !== UserRole.ADMIN) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, adminOnly]);

  // 認証情報の読み込み中はローディング表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // ユーザーが存在しない場合は何も表示しない（リダイレクト中）
  if (!user) {
    return null;
  }

  // 管理者専用ルートで、ユーザーが管理者でない場合は何も表示しない（リダイレクト中）
  if (adminOnly && user.role !== UserRole.ADMIN) {
    return null;
  }

  // 認証済みならば子コンポーネントを表示
  return <>{children}</>;
};

export default ProtectedRoute; 