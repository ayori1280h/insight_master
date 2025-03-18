import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/hooks/useAuth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'インサイトマスター',
  description: '記事のインサイトを管理・分析するアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex h-screen">
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
