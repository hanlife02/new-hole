'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Layout from '@/components/Layout';
import HoleCard from '@/components/HoleCard';

export default function KeySearch() {
  const { data: session } = useSession();
  const [holes, setHoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    searchType: 'and'
  });

  const fetchHoles = async (pageNum = 0) => {
    if (!session || !searchParams.keywords.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        keywords: searchParams.keywords,
        type: searchParams.searchType,
        page: pageNum.toString()
      });

      const res = await fetch(`/api/holes/search?${params}`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' }
      });
      const data = await res.json();

      if (pageNum === 0) {
        setHoles(data);
      } else {
        setHoles(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Failed to search holes:', error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(0);
    fetchHoles(0);
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
        <h1 className="text-2xl font-bold">关键词查询</h1>

        <div className="border border-black dark:border-white rounded-lg p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                关键词 (多个关键词用逗号分隔)
              </label>
              <input
                type="text"
                value={searchParams.keywords}
                onChange={(e) => setSearchParams(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="输入关键词，如：学习,考试"
                className="w-full p-2 border border-black dark:border-white rounded bg-white dark:bg-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">搜索类型</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="and"
                    checked={searchParams.searchType === 'and'}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, searchType: e.target.value }))}
                    className="mr-2"
                  />
                  与搜索 (包含所有关键词)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="or"
                    checked={searchParams.searchType === 'or'}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, searchType: e.target.value }))}
                    className="mr-2"
                  />
                  或搜索 (包含任一关键词)
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !searchParams.keywords.trim()}
            className="px-6 py-2 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
          >
            {loading ? '搜索中...' : '搜索'}
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

        {holes.length === 0 && !loading && searchParams.keywords && (
          <div className="text-center text-gray-500">
            未找到匹配的树洞
          </div>
        )}
      </div>
    </Layout>
  );
}