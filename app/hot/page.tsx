'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HoleCard } from '@/components/HoleCard';
import { HoleWithComments, HotHoleFilters } from '@/types';
import { Search, ChevronDown } from 'lucide-react';

export default function HotPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [holes, setHoles] = useState<HoleWithComments[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [customThreshold, setCustomThreshold] = useState('');

  const [filters, setFilters] = useState<HotHoleFilters>({
    timeRange: '24h',
    sortBy: 'both',
    threshold: 20
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('casdoor');
      return;
    }
  }, [session, status, router]);

  const fetchHoles = async (offset = 0) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        timeRange: filters.timeRange,
        sortBy: filters.sortBy,
        threshold: filters.threshold.toString(),
        offset: offset.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/holes/hot?${params}`);
      if (response.ok) {
        const data = await response.json();

        if (offset === 0) {
          setHoles(data.holes);
          setHasSearched(true);
        } else {
          setHoles(prev => [...prev, ...data.holes]);
        }

        setTotal(data.total);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('获取热点树洞失败:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    fetchHoles(0);
  };

  const loadMore = () => {
    fetchHoles(holes.length);
  };

  const handleThresholdChange = (value: string) => {
    if (value === 'custom') {
      setCustomThreshold('');
    } else {
      setFilters(prev => ({ ...prev, threshold: parseInt(value) }));
      setCustomThreshold('');
    }
  };

  const handleCustomThresholdSubmit = () => {
    const value = parseInt(customThreshold);
    if (!isNaN(value) && value > 0) {
      setFilters(prev => ({ ...prev, threshold: value }));
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

  const presetThresholds = [20, 50, 100, 300];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          热点树洞
        </h1>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                时间范围
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white"
              >
                <option value="24h">24小时内</option>
                <option value="3d">3天内</option>
                <option value="7d">7天内</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                排序方式
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white"
              >
                <option value="star">收藏数</option>
                <option value="reply">回复数</option>
                <option value="both">收藏数+回复数</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                阈值
              </label>
              <select
                value={presetThresholds.includes(filters.threshold) ? filters.threshold.toString() : 'custom'}
                onChange={(e) => handleThresholdChange(e.target.value)}
                className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white"
              >
                {presetThresholds.map(threshold => (
                  <option key={threshold} value={threshold.toString()}>
                    {threshold}
                  </option>
                ))}
                <option value="custom">自定义</option>
              </select>
            </div>

            {!presetThresholds.includes(filters.threshold) && (
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  自定义阈值
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={customThreshold}
                    onChange={(e) => setCustomThreshold(e.target.value)}
                    placeholder="输入数值"
                    className="flex-1 p-2 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white"
                  />
                  <button
                    onClick={handleCustomThresholdSubmit}
                    className="px-3 py-2 border border-black dark:border-white rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                  >
                    确定
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? '查询中...' : '查询'}</span>
          </button>
        </div>

        {hasSearched && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                找到 {total} 个符合条件的热点树洞
              </p>
            </div>

            <div className="space-y-6">
              {holes.map((hole) => (
                <HoleCard key={hole.pid} hole={hole} />
              ))}
            </div>

            {holes.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="text-gray-600 dark:text-gray-400">
                  没有找到符合条件的热点树洞
                </div>
              </div>
            )}

            {hasMore && holes.length > 0 && (
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
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-20">
            <div className="text-gray-600 dark:text-gray-400">
              请设置筛选条件并点击查询按钮
            </div>
          </div>
        )}
      </main>
    </div>
  );
}