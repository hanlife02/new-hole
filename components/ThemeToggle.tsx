'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
      aria-label="切换主题"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-black" />
      ) : (
        <Sun className="h-5 w-5 text-white" />
      )}
    </button>
  );
}