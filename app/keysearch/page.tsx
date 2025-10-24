'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HoleCard } from '@/components/HoleCard';
import { HoleWithComments } from '@/types';
import { Search, ChevronDown } from 'lucide-react';

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
  const router = useRouter();
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
  }, [session, status, router]);

  const fetchHoles = async (offset = 0) => {
    if (!keywords.trim()) {
      setError('请输入关键词');
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
        setError(data.error || '搜索失败');
      }
    } catch (error) {
      console.error('关键词搜索失败:', error);
      setError('搜索失败，请稍后重试');
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
          <div className="text-black dark:text-white">加载中...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          关键词查询
        </h1>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                输入关键词（用空格分隔多个关键词）
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例如: 学习 考试 或者 编程"
                className="w-full p-3 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                搜索方式
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="or"
                    checked={searchType === 'or'}
                    onChange={(e) => setSearchType(e.target.value as 'or')}
                    className="mr-2"
                  />
                  <span className="text-black dark:text-white">或搜索（包含任一关键词）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="and"
                    checked={searchType === 'and'}
                    onChange={(e) => setSearchType(e.target.value as 'and')}
                    className="mr-2"
                  />
                  <span className="text-black dark:text-white">与搜索（包含所有关键词）</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? '搜索中...' : '搜索'}</span>
            </button>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {hasSearched && searchInfo && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              搜索关键词: {searchInfo.keywords.join(', ')} |
              搜索方式: {searchType === 'or' ? '或搜索' : '与搜索'} |
              找到 {total} 个结果
            </p>
          </div>
        )}

        {hasSearched && (
          <>
            <div className="space-y-6">
              {holes.map((hole) => (
                <HoleCard key={hole.pid} hole={hole} />
              ))}
            </div>

            {holes.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="text-gray-600 dark:text-gray-400">
                  没有找到包含指定关键词的树洞
                </div>
              </div>
            )}

            {hasMore && holes.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center space-x-2 px-6 py-3 border border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  <ChevronDown className="h-4 w-4 text-black dark:text-white" />
                  <span className="text-black dark:text-white">
                    {loadingMore ? '加载中...' : '加载更多'}
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-20">
            <div className="text-gray-600 dark:text-gray-400">
              请输入关键词并点击搜索按钮
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              支持多关键词搜索，用空格分隔关键词
            </div>
          </div>
        )}
      </main>
    </div>
  );
}