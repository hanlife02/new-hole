'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ holes: 0, comments: 0 });

  useEffect(() => {
    if (session) {
      import('@/lib/api').then(({ apiRequest }) => {
        apiRequest('/api/stats')
          .then(res => res.json())
          .then(data => setStats(data))
          .catch(() => {});
      });
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/Ethan-clud-o.png"
            alt="Ethan Hole"
            width={120}
            height={120}
            className="rounded-lg"
          />
          <h1 className="text-4xl font-bold">Ethan Hole</h1>
        </div>

        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.holes}</div>
            <div className="text-sm">树洞总数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.comments}</div>
            <div className="text-sm">评论总数</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <a href="/latest" className="p-4 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
            最新树洞
          </a>
          <a href="/hot" className="p-4 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
            热点树洞
          </a>
          <a href="/pidsearch" className="p-4 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
            PID查询
          </a>
          <a href="/keysearch" className="p-4 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
            关键词查询
          </a>
        </div>
      </div>
    </Layout>
  );
}