'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { LogOut, Menu, X } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import homeCopy from '@/content/home.json';
import Image from 'next/image';

export function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language } = useLanguage();
  const home = homeCopy[language];
  const navItems = home.quickAccess.items;
  const navigationCopy = home.navigation;

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur-sm transition-colors duration-300 dark:border-white/10 dark:bg-black/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-black transition-colors duration-300 whitespace-nowrap dark:text-white"
          >
            <Image src="/Ethan-Club-o.PNG" alt="Ethan Hole" width={28} height={28} className="rounded-full" />
            Ethan Hole
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center text-sm font-medium tracking-tight after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 after:content-[''] dark:after:bg-white ${
                  pathname === item.href
                    ? 'text-black after:scale-x-100 dark:text-white'
                    : 'text-gray-500 transition-colors duration-300 hover:text-black hover:after:scale-x-100 dark:text-gray-400 dark:hover:text-white'
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="hidden items-center justify-center rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-black transition-colors duration-300 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10 md:inline-flex"
            aria-label={navigationCopy.signOutAria}
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button
            onClick={toggleMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-black transition-colors duration-300 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10 md:hidden"
            aria-label={navigationCopy.menuAria}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-black/10 bg-white/95 backdrop-blur-sm transition-colors duration-300 dark:border-white/10 dark:bg-black/80 md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <LanguageToggle className="flex-1 justify-between" />
              <ThemeToggle />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center justify-between border-b border-black/5 py-3 text-base font-medium last:border-b-0 dark:border-white/10 ${
                  pathname === item.href
                    ? 'text-black dark:text-white'
                    : 'text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {item.label}
                <span className="text-lg text-gray-400 dark:text-gray-500">→</span>
              </Link>
            ))}
            <button
              onClick={() => {
                closeMenu();
                signOut({ callbackUrl: '/auth/signin' });
              }}
              className="mt-4 inline-flex items-center justify-center rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-black transition-colors duration-300 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              {navigationCopy.signOut}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
