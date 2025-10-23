'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApiKeyAuth() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        document.cookie = `apiKey=${apiKey}; path=/; max-age=86400`;
        router.push('/');
      } else {
        setError('API Key 无效');
      }
    } catch (error) {
      setError('验证失败，请重试');
    }
    setLoading(false);
  };

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black dark:text-white">
            API Key 验证
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            欢迎 {session.user?.name}，请输入您的API Key
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入API Key"
              className="w-full p-3 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            className="w-full py-3 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
          >
            {loading ? '验证中...' : '验证'}
          </button>
        </form>
      </div>
    </div>
  );
}