'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HoleCard } from '@/components/HoleCard';
import { HoleWithComments } from '@/types';
import { RefreshCw } from 'lucide-react';
import pagesCopy from '@/content/pages.json';
import { useLanguage } from '@/components/LanguageProvider';

export default function LatestPage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const copy = pagesCopy[language].latest;
  const common = pagesCopy[language].common;
  const [holes, setHoles] = useState<HoleWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('casdoor');
      return;
    }

    fetchHoles();
  }, [session, status]);

  const fetchHoles = async (cursor?: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (cursor !== undefined) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({ limit: '20' });
      if (cursor !== undefined) {
        params.set('cursor', String(cursor));
      }

      const response = await fetch(`/api/holes/latest?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();

        if (isRefresh || cursor === undefined) {
          setHoles(data.holes);
        } else {
          setHoles(prev => {
            const existingPids = new Set(prev.map((hole) => hole.pid));
            const merged = [
              ...prev,
              ...data.holes.filter((hole: HoleWithComments) => !existingPids.has(hole.pid)),
            ];
            return merged;
          });
        }

        setHasMore(Boolean(data.hasMore));
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
    fetchHoles(undefined, true);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) {
      return;
    }

    const lastHole = holes[holes.length - 1];
    if (!lastHole) {
      return;
    }

    const lastPid = Number(lastHole.pid);
    if (Number.isNaN(lastPid)) {
      return;
    }

    fetchHoles(lastPid);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-black dark:text-white">{common.loading}</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const displayedHoles = holes;
  const canLoadMore = hasMore;

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-semibold text-black dark:text-white">
            {copy.title}
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:opacity-80 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? copy.refreshing : copy.refresh}</span>
          </button>
        </div>

        <div className="space-y-4">
          {displayedHoles.map((hole) => (
            <HoleCard key={hole.pid} hole={hole} />
          ))}
        </div>

        {displayedHoles.length === 0 && !loading && (
          <div className="text-center py-32">
            <div className="text-gray-500 dark:text-gray-400 text-lg">{copy.empty}</div>
          </div>
        )}

        {canLoadMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-white dark:bg-[#1d1d1f] text-black dark:text-white rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2d2d2f] disabled:opacity-50"
            >
              {loadingMore ? copy.loadingMore : copy.loadMore}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
