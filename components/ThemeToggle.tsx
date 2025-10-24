'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import homeCopy from '@/content/home.json';
import { useLanguage } from './LanguageProvider';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const label = homeCopy[language].preferences.themeToggleAria;

  const baseClasses =
    'inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-black transition-colors duration-300 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10';
  const mergedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <button
      onClick={toggleTheme}
      className={mergedClasses}
      aria-label={label}
      type="button"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}
