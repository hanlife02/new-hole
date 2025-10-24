'use client';

import { useState, useRef, useEffect } from 'react';
import { Language, useLanguage } from './LanguageProvider';
import { Languages } from 'lucide-react';
import homeCopy from '@/content/home.json';

const order: Language[] = ['zh', 'en'];

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps = {}) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageCopy = homeCopy[language].language;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseClasses = 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-black transition-colors duration-300 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10';
  const mergedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={mergedClasses}
        aria-label={languageCopy.label}
        type="button"
      >
        <Languages className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 rounded-md border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-[#0f0f12]">
          {order.map((value) => {
            const isActive = language === value;
            const label = languageCopy.options[value];

            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setLanguage(value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors first:rounded-t-md last:rounded-b-md ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
