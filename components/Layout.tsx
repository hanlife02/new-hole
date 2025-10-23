'use client';

import { useTheme } from './ThemeProvider';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <header className="border-b border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-4">
              <Image
                src="/Ethan-clud-o.png"
                alt="Ethan Hole"
                width={40}
                height={40}
                className="rounded"
              />
              <h1 className="text-2xl font-bold">Ethan Hole</h1>
            </Link>

            <nav className="flex items-center space-x-6">
              <Link href="/latest" className="hover:underline">最新树洞</Link>
              <Link href="/hot" className="hover:underline">热点树洞</Link>
              <Link href="/pidsearch" className="hover:underline">PID查询</Link>
              <Link href="/keysearch" className="hover:underline">关键词查询</Link>

              <button
                onClick={toggleTheme}
                className="p-2 border border-black dark:border-white rounded"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              <button
                onClick={() => signOut()}
                className="px-4 py-2 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                退出
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}