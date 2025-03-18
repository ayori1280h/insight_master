import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
          インサイトマスター
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl">
          洞察力を鍛え、批判的思考を育てるトレーニングアプリケーション
        </p>
        
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-5xl">
          <Link href="/dashboard" className="group">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-medium text-gray-900">ダッシュボード</h2>
              <p className="mt-2 text-gray-600">あなたの進捗状況と推奨トレーニングを確認</p>
            </div>
          </Link>
          
          <Link href="/training" className="group">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-3 bg-green-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-medium text-gray-900">トレーニング</h2>
              <p className="mt-2 text-gray-600">洞察力を鍛えるトレーニングを開始</p>
            </div>
          </Link>
          
          <Link href="/articles" className="group">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-medium text-gray-900">記事ライブラリ</h2>
              <p className="mt-2 text-gray-600">トレーニング用の記事を閲覧・管理</p>
            </div>
          </Link>
          
          <Link href="/profile" className="group">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-medium text-gray-900">プロフィール</h2>
              <p className="mt-2 text-gray-600">あなたの強みと弱みを分析</p>
            </div>
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900">インサイトマスターとは</h2>
          <p className="mt-4 text-gray-600 text-left">
            インサイトマスターは、あなたの洞察力を段階的に鍛えるためのトレーニングアプリケーションです。
            様々なジャンルの記事を読み、その内容に対する洞察力を向上させることができます。
            AIが記事を分析し、隠れた前提条件、因果関係、矛盾点、データの解釈方法、著者のバイアス、
            業界トレンドとの関連性など、洞察すべきポイントを提示します。
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/training" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200">
              トレーニングを始める
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="w-full border-t border-gray-200 py-6 mt-12">
        <div className="text-center text-gray-500">
          © 2025 インサイトマスター
        </div>
      </footer>
    </div>
  );
}
