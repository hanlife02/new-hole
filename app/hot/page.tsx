'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HoleCard } from '@/components/HoleCard';
import { HoleWithComments, HotHoleFilters } from '@/types';
import { Search } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import pagesCopy from '@/content/pages.json';

export default function HotPage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const pageCopy = pagesCopy[language];
  const copy = pageCopy.hot;
  const common = pageCopy.common;
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
  }, [session, status]);

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
      setFilters(prev => ({ ...prev, threshold: -1 }));
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
          <div className="text-black dark:text-white">{common.loading}</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const presetThresholds = [20, 50, 100, 300];

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-semibold text-black dark:text-white mb-10">
          {copy.title}
        </h1>

        <div className="bg-white dark:bg-[#1d1d1f] p-8 rounded-3xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {copy.filters.timeRange}
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="w-full p-3 border-0 bg-[#f5f5f7] dark:bg-black rounded-xl text-black dark:text-white"
              >
                <option value="24h">{copy.filters.timeOptions['24h']}</option>
                <option value="3d">{copy.filters.timeOptions['3d']}</option>
                <option value="7d">{copy.filters.timeOptions['7d']}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {copy.filters.sortBy}
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full p-3 border-0 bg-[#f5f5f7] dark:bg-black rounded-xl text-black dark:text-white"
              >
                <option value="star">{copy.filters.sortOptions.star}</option>
                <option value="reply">{copy.filters.sortOptions.reply}</option>
                <option value="both">{copy.filters.sortOptions.both}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {copy.filters.threshold}
              </label>
              <select
                value={presetThresholds.includes(filters.threshold) ? filters.threshold.toString() : 'custom'}
                onChange={(e) => handleThresholdChange(e.target.value)}
                className="w-full p-3 border-0 bg-[#f5f5f7] dark:bg-black rounded-xl text-black dark:text-white"
              >
                {presetThresholds.map(threshold => (
                  <option key={threshold} value={threshold.toString()}>
                    {threshold}
                  </option>
                ))}
                <option value="custom">{copy.filters.customOption}</option>
              </select>
            </div>

            {filters.threshold === -1 && (
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {copy.filters.customThreshold}
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={customThreshold}
                    onChange={(e) => setCustomThreshold(e.target.value)}
                    placeholder={copy.filters.customThresholdPlaceholder}
                    className="flex-1 p-3 border-0 bg-[#f5f5f7] dark:bg-black rounded-xl text-black dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={handleCustomThresholdSubmit}
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:opacity-80"
                  >
                    {copy.filters.customThresholdConfirm}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:opacity-80 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? copy.searching : copy.searchButton}</span>
          </button>
        </div>

        {hasSearched && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {copy.results.replace('{count}', total.toString())}
              </p>
            </div>

            <div className="space-y-4">
              {holes.map((hole) => (
                <HoleCard key={hole.pid} hole={hole} />
              ))}
            </div>

            {holes.length === 0 && !loading && (
              <div className="text-center py-32">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  {copy.empty}
                </div>
              </div>
            )}

            {hasMore && holes.length > 0 && (
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
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-32">
          </div>
        )}
      </main>
    </div>
  );
}
