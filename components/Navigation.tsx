'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import { LogOut } from 'lucide-react';

const navItems = [
  { href: '/latest', label: '最新树洞' },
  { href: '/hot', label: '热点树洞' },
  { href: '/pidsearch', label: 'PID查询' },
  { href: '/keysearch', label: '关键词查询' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-black dark:border-white bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-black dark:text-white">
              Ethan Hole
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="p-2 rounded-lg border border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              aria-label="退出登录"
            >
              <LogOut className="h-5 w-5 text-black dark:text-white" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}