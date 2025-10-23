'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Layout from '@/components/Layout';
import HoleCard from '@/components/HoleCard';

export default function Hot() {
  const { data: session } = useSession();
  const [holes, setHoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    timeRange: '24h',
    sortBy: 'stars',
    threshold: 20,
    customThreshold: ''
  });

  const fetchHoles = async (pageNum = 0, newFilters = filters) => {
    if (!session) return;

    setLoading(true);
    try {
      const threshold = newFilters.customThreshold || newFilters.threshold;
      const params = new URLSearchParams({
        timeRange: newFilters.timeRange,
        sortBy: newFilters.sortBy,
        threshold: threshold.toString(),
        page: pageNum.toString()
      });

      const res = await fetch(`/api/holes/hot?${params}`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' }
      });
      const data = await res.json();

      if (pageNum === 0) {
        setHoles(data);
      } else {
        setHoles(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Failed to fetch holes:', error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(0);
    fetchHoles(0, filters);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHoles(nextPage);
  };

  if (!session) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">热点树洞</h1>

        <div className="border border-black dark:border-white rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">时间范围</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-black"
              >
                <option value="24h">24小时内</option>
                <option value="3d">3天内</option>
                <option value="7d">7天内</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">排序方式</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-black"
              >
                <option value="stars">收藏数</option>
                <option value="replies">回复数</option>
                <option value="combined">收藏数+回复数</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">阈值</label>
              <select
                value={filters.threshold}
                onChange={(e) => setFilters(prev => ({ ...prev, threshold: parseInt(e.target.value), customThreshold: '' }))}
                className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-black"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={300}>300</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">自定义阈值</label>
              <input
                type="number"
                value={filters.customThreshold}
                onChange={(e) => setFilters(prev => ({ ...prev, customThreshold: e.target.value }))}
                placeholder="自定义数值"
                className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-black"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
          >
            {loading ? '查询中...' : '查询'}
          </button>
        </div>

        <div className="space-y-4">
          {holes.map((hole: any) => (
            <HoleCard key={hole.pid} hole={hole} />
          ))}
        </div>

        {holes.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}

        {holes.length === 0 && !loading && (
          <div className="text-center text-gray-500">
            请点击查询按钮开始搜索热点树洞
          </div>
        )}
      </div>
    </Layout>
  );
}