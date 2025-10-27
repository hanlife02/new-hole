'use client';

import { useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';

type AutoSignInProps = {
  callbackUrl: string;
};

export default function AutoSignIn({ callbackUrl }: AutoSignInProps) {
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (initiatedRef.current) {
      return;
    }

    initiatedRef.current = true;

    void signIn('casdoor', {
      callbackUrl: callbackUrl || '/',
    });
  }, [callbackUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-600 dark:text-gray-300">正在跳转到 Casdoor 进行登录...</p>
    </div>
  );
}
