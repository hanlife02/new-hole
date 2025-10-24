'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HoleCard } from '@/components/HoleCard';
import { HoleWithComments } from '@/types';
import { Search } from 'lucide-react';

export default function PidSearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pid, setPid] = useState('');
  const [hole, setHole] = useState<HoleWithComments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('casdoor');
      return;
    }
  }, [session, status, router]);

  const handleSearch = async () => {
    if (!pid.trim()) {
      setError('请输入PID');
      return;
    }

    const pidNumber = parseInt(pid.trim());
    if (isNaN(pidNumber) || pidNumber <= 0) {
      setError('PID必须是正整数');
      return;
    }

    setLoading(true);
    setError('');
    setHole(null);

    try {
      const response = await fetch(`/api/holes/pid?pid=${pidNumber}`);
      const data = await response.json();

      if (response.ok) {
        setHole(data.hole);
      } else {
        setError(data.error || '查询失败');
      }
    } catch (error) {
      console.error('PID查询失败:', error);
      setError('查询失败，请稍后重试');
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-black dark:text-white">加载中...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          PID查询
        </h1>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-8">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                输入树洞PID
              </label>
              <input
                type="number"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例如: 12345"
                className="w-full p-3 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                <span>{loading ? '查询中...' : '查询'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {hole && (
          <div className="space-y-6">
            <HoleCard hole={hole} />
          </div>
        )}

        {hasSearched && !hole && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-gray-600 dark:text-gray-400">
              未找到指定PID的树洞
            </div>
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-20">
            <div className="text-gray-600 dark:text-gray-400">
              请输入PID并点击查询按钮
            </div>
          </div>
        )}
      </main>
    </div>
  );
}