'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HoleCard } from '@/components/HoleCard';
import { HoleWithComments } from '@/types';
import { RefreshCw, ChevronDown } from 'lucide-react';

export default function LatestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [holes, setHoles] = useState<HoleWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('casdoor');
      return;
    }

    fetchHoles();
  }, [session, status, router]);

  const fetchHoles = async (offset = 0, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (offset > 0) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/holes/latest?offset=${offset}&limit=20`);
      if (response.ok) {
        const data = await response.json();

        if (isRefresh || offset === 0) {
          setHoles(data.holes);
          setVisibleCount(20);
        } else {
          setHoles(prev => [...prev, ...data.holes]);
        }

        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('获取树洞失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    fetchHoles(0, true);
  };

  const loadMore = () => {
    if (visibleCount >= holes.length && hasMore) {
      fetchHoles(holes.length);
    } else {
      setVisibleCount(prev => prev + 20);
    }
  };

  if (status === 'loading' || loading) {
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

  const displayedHoles = holes.slice(0, visibleCount);
  const canLoadMore = visibleCount < holes.length || hasMore;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            最新树洞
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 border border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-black dark:text-white ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-black dark:text-white">
              {refreshing ? '刷新中...' : '刷新'}
            </span>
          </button>
        </div>

        <div className="space-y-6">
          {displayedHoles.map((hole) => (
            <HoleCard key={hole.pid} hole={hole} />
          ))}
        </div>

        {displayedHoles.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-gray-600 dark:text-gray-400">暂无树洞</div>
          </div>
        )}

        {canLoadMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center space-x-2 px-6 py-3 border border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              <ChevronDown className="h-4 w-4 text-black dark:text-white" />
              <span className="text-black dark:text-white">
                {loadingMore ? '加载中...' : '加载更多'}
              </span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}