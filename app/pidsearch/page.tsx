'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HoleCard } from '@/components/HoleCard';
import { HoleWithComments } from '@/types';
import { Search } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import pagesCopy from '@/content/pages.json';

export default function PidSearchPage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const pageCopy = pagesCopy[language];
  const copy = pageCopy.pid;
  const common = pageCopy.common;
  const [pid, setPid] = useState('');
  const [hole, setHole] = useState<HoleWithComments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('casdoor');
      return;
    }
  }, [session, status]);

  const handleSearch = async () => {
    if (!pid.trim()) {
      setError(copy.errors.empty);
      return;
    }

    const pidNumber = parseInt(pid.trim());
    if (isNaN(pidNumber) || pidNumber <= 0) {
      setError(copy.errors.invalid);
      return;
    }

    setLoading(true);
    setError('');
    setHole(null);

    try {
      const response = await fetch(`/api/holes/pid?pid=${pidNumber}`);
      const data = await response.json();

      if (response.ok) {
        setHole(data.hole);
      } else {
        setError(data.error || copy.errors.generic);
      }
    } catch (error) {
      console.error('PID查询失败:', error);
      setError(copy.errors.generic);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-black dark:text-white">{common.loading}</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-semibold text-black dark:text-white mb-10">
          {copy.title}
        </h1>

        <div className="bg-white dark:bg-[#1d1d1f] p-8 rounded-3xl mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {copy.inputLabel}
              </label>
              <input
                type="number"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={copy.placeholder}
                className="w-full p-4 border-0 bg-[#f5f5f7] dark:bg-black rounded-xl text-black dark:text-white"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:opacity-80 disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                <span>{loading ? copy.searching : copy.searchButton}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {hole && (
          <div className="space-y-4">
            <HoleCard hole={hole} />
          </div>
        )}

        {hasSearched && !hole && !loading && !error && (
          <div className="text-center py-32">
            <div className="text-gray-500 dark:text-gray-400 text-lg">
              {copy.notFound}
            </div>
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-32">
          </div>
        )}
      </main>
    </div>
  );
}
