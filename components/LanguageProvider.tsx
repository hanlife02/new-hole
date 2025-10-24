'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('language');
      if (stored === 'zh' || stored === 'en') {
        setLanguageState(stored);
        return;
      }

      const browserLanguage = typeof navigator !== 'undefined'
        ? navigator.language.toLowerCase()
        : '';

      if (browserLanguage.startsWith('en')) {
        setLanguageState('en');
      }
    } catch (error) {
      console.error('读取语言偏好失败:', error);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    try {
      localStorage.setItem('language', nextLanguage);
    } catch (error) {
      console.error('存储语言偏好失败:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage 必须在 LanguageProvider 内使用');
  }
  return context;
}
