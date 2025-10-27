'use client';

import { useEffect } from 'react';

type CallbackRedirectProps = {
  target: string;
};

export default function CallbackRedirect({ target }: CallbackRedirectProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.location.replace(target);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [target]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">登入成功</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">正在加载...</p>
    </div>
  );
}
