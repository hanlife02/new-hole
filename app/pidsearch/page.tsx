'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Layout from '@/components/Layout';
import HoleCard from '@/components/HoleCard';

export default function PidSearch() {
  const { data: session } = useSession();
  const [hole, setHole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pid, setPid] = useState('');
  const [error, setError] = useState('');

  const fetchHole = async () => {
    if (!session || !pid.trim()) return;

    const pidNum = parseInt(pid);
    if (isNaN(pidNum)) {
      setError('请输入有效的PID数字');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/holes/${pidNum}`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' }
      });

      if (res.status === 404) {
        setError('未找到该PID对应的树洞');
        setHole(null);
      } else if (res.ok) {
        const data = await res.json();
        setHole(data);
      } else {
        setError('查询失败，请重试');
      }
    } catch (error) {
      setError('查询失败，请重试');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchHole();
    }
  };

  if (!session) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">PID查询</h1>

        <div className="border border-black dark:border-white rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              树洞PID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入树洞PID，如：12345"
                className="flex-1 p-2 border border-black dark:border-white rounded bg-white dark:bg-black"
              />
              <button
                onClick={fetchHole}
                disabled={loading || !pid.trim()}
                className="px-6 py-2 border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
              >
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>

        {hole && (
          <div>
            <HoleCard hole={hole} />
          </div>
        )}
      </div>
    </Layout>
  );
}