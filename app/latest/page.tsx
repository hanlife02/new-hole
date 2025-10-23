'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import HoleCard from '@/components/HoleCard';

export default function Latest() {
  const { data: session } = useSession();
  const [holes, setHoles] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchHoles = async (pageNum = 0, refresh = false) => {
    if (!session) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/holes/latest?page=${pageNum}`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' }
      });
      const data = await res.json();

      if (refresh || pageNum === 0) {
        setHoles(data);
      } else {
        setHoles(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Failed to fetch holes:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHoles(0);
  }, [session]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHoles(nextPage);
  };

  const refresh = () => {
    setPage(0);
    fetchHoles(0, true);
  };

  if (!session) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">最新树洞</h1>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
          >
            {loading ? '加载中...' : '刷新'}
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
      </div>
    </Layout>
  );
}