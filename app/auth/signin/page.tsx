import AutoSignIn from './AutoSignIn';

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
    callbackUrl = rawCallback;

    try {
      callbackUrl = decodeURIComponent(callbackUrl);
    } catch {
      // ignore decoding issues and fall back to raw value
    }
  }

  return <AutoSignIn callbackUrl={callbackUrl} />;
}
