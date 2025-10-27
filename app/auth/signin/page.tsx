import { redirect } from 'next/navigation';

type SignInPageProps = {
  searchParams?: {
    callbackUrl?: string;
  };
};

export const dynamic = 'force-dynamic';

export default function SignInPage({ searchParams }: SignInPageProps) {
  const rawCallback = searchParams?.callbackUrl;
  let callbackUrl = '/';

  if (typeof rawCallback === 'string' && rawCallback.length > 0) {
    try {
      callbackUrl = decodeURIComponent(rawCallback);
    } catch {
      callbackUrl = rawCallback;
    }
  }

  const target = `/api/auth/signin?provider=casdoor&callbackUrl=${encodeURIComponent(callbackUrl)}`;

  redirect(target);
}
