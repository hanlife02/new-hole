'use client';

import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

export default function SignIn() {
  useEffect(() => {
    const timer = setTimeout(() => {
      signIn('casdoor', { callbackUrl: '/auth/apikey' });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
        <p className="mt-4 text-black dark:text-white">正在跳转到登录页面...</p>
      </div>
    </div>
  );
}