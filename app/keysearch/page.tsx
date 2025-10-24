'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HoleCard } from '@/components/HoleCard';
import { HoleWithComments } from '@/types';
import { Search } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import pagesCopy from '@/content/pages.json';

interface SearchResult {
  holes: HoleWithComments[];
  total: number;
  hasMore: boolean;
  searchInfo: {
    keywords: string[];
    searchType: string;
    total: number;
  };
}

export default function KeySearchPage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const pageCopy = pagesCopy[language];
  const copy = pageCopy.keySearch;
  const common = pageCopy.common;
  const [keywords, setKeywords] = useState('');
  const [searchType, setSearchType] = useState<'or' | 'and'>('or');
  const [holes, setHoles] = useState<HoleWithComments[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchInfo, setSearchInfo] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('casdoor');
      return;
    }
  }, [session, status]);

  const fetchHoles = async (offset = 0) => {
    if (!keywords.trim()) {
      setError(copy.errors.empty);
      return;
    }

    try {
      if (offset === 0) {
        setLoading(true);
        setError('');
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        keywords: keywords.trim(),
        searchType,
        offset: offset.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/holes/search?${params}`);
      const data: SearchResult = await response.json();

      if (response.ok) {
        if (offset === 0) {
          setHoles(data.holes);
          setHasSearched(true);
          setSearchInfo(data.searchInfo);
        } else {
          setHoles(prev => [...prev, ...data.holes]);
        }

        setTotal(data.total);
        setHasMore(data.hasMore);
      } else {
        setError(data.error || copy.errors.generic);
      }
    } catch (error) {
      console.error('关键词搜索失败:', error);
      setError(copy.errors.generic);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    fetchHoles(0);
  };

  const loadMore = () => {
    fetchHoles(holes.length);
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {copy.inputLabel}
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={copy.placeholder}
                className="w-full p-4 border-0 bg-[#f5f5f7] dark:bg-black rounded-xl text-black dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                {copy.modeLabel}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="or"
                    checked={searchType === 'or'}
                    onChange={(e) => setSearchType(e.target.value as 'or')}
                    className="mr-2"
                  />
                  <span className="text-black dark:text-white">{copy.modeOr}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="and"
                    checked={searchType === 'and'}
                    onChange={(e) => setSearchType(e.target.value as 'and')}
                    className="mr-2"
                  />
                  <span className="text-black dark:text-white">{copy.modeAnd}</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:opacity-80 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? copy.searching : copy.searchButton}</span>
            </button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {hasSearched && searchInfo && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {copy.summary
                .replace('{keywords}', searchInfo.keywords.join(', '))
                .replace('{mode}', copy.summaryMode[searchType])
                .replace('{count}', total.toString())}
            </p>
          </div>
        )}

        {hasSearched && (
          <>
            <div className="space-y-4">
              {holes.map((hole) => (
                <HoleCard key={hole.pid} hole={hole} />
              ))}
            </div>

            {holes.length === 0 && !loading && (
              <div className="text-center py-32">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  {copy.empty}
                </div>
              </div>
            )}

            {hasMore && holes.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white dark:bg-[#1d1d1f] text-black dark:text-white rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2d2d2f] disabled:opacity-50"
                >
                  {loadingMore ? copy.loadingMore : copy.loadMore}
                </button>
              </div>
            )}
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-32">
          </div>
        )}
      </main>
    </div>
  );
}
