'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Stats {
  holes: number;
  comments: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('casdoor');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('获取统计信息失败:', error);
      }
    };

    fetchStats();
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-black dark:text-white">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { href: '/latest', label: '最新树洞', description: '查看最新发布的树洞' },
    { href: '/hot', label: '热点树洞', description: '查看热门讨论的树洞' },
    { href: '/pidsearch', label: 'PID查询', description: '通过PID查找特定树洞' },
    { href: '/keysearch', label: '关键词查询', description: '通过关键词搜索树洞内容' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            Ethan Hole
          </h1>

          <div className="mb-8">
            <Image
              src="/Ethan-Club-o.png"
              alt="Ethan Club Logo"
              width={200}
              height={200}
              className="mx-auto rounded-full"
              priority
            />
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-black dark:text-white">
                {stats?.holes ?? '...'}
              </div>
              <div className="text-gray-600 dark:text-gray-400">树洞总数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black dark:text-white">
                {stats?.comments ?? '...'}
              </div>
              <div className="text-gray-600 dark:text-gray-400">评论总数</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-6 border border-black dark:border-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                {item.label}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}