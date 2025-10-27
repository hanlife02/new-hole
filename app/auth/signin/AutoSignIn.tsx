'use client';

import { useEffect, useMemo, useRef } from 'react';
import { signIn } from 'next-auth/react';

type AutoSignInProps = {
  callbackUrl: string;
  defaultCallbackUrl: string;
};

function pickCallbackUrl(target: string, fallback: string) {
  const normalizedFallback = fallback.startsWith('/') ? fallback : '/';

  if (target.startsWith('/')) {
    return target;
  }

  return normalizedFallback;
}

export default function AutoSignIn({ callbackUrl, defaultCallbackUrl }: AutoSignInProps) {
  const initiatedRef = useRef(false);
  const resolvedCallbackUrl = useMemo(
    () => pickCallbackUrl(callbackUrl, defaultCallbackUrl),
    [callbackUrl, defaultCallbackUrl],
  );

  useEffect(() => {
    if (initiatedRef.current) {
      return;
    }

    initiatedRef.current = true;

    void signIn('casdoor', {
      callbackUrl: resolvedCallbackUrl,
    });
  }, [resolvedCallbackUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-600 dark:text-gray-300">正在跳转到 Casdoor 进行登录...</p>
    </div>
  );
}
