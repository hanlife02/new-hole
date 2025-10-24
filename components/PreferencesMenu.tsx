'use client';

import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import homeCopy from '@/content/home.json';
import { useLanguage } from './LanguageProvider';

export function PreferencesMenu() {
  const { language } = useLanguage();
  const copy = homeCopy[language];

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white/80 px-3 py-2 text-xs font-medium text-black shadow-sm transition-colors duration-300 hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>{copy.preferences.label}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-black/10 bg-white/95 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-black/80"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {copy.language.label}
              </p>
              <LanguageToggle className="w-full justify-between" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {copy.preferences.themeLabel}
              </p>
              <div className="flex items-center justify-between rounded-md border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/10">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {copy.preferences.themeDescription}
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
