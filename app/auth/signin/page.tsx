import { normalizeRelativeUrl } from '@/lib/url';
import AutoSignIn from './AutoSignIn';

type SignInPageProps = {
  searchParams?: {
    callbackUrl?: string;
  };
};

export const dynamic = 'force-dynamic';

export default function SignInPage({ searchParams }: SignInPageProps) {
  const rawCallback = searchParams?.callbackUrl;
  const baseUrl = process.env.NEXTAUTH_URL;
  const configuredDefault =
    normalizeRelativeUrl(process.env.NEXT_PUBLIC_DEFAULT_CALLBACK_URL, baseUrl) ?? '/';
  let callbackUrl = configuredDefault;

  if (typeof rawCallback === 'string' && rawCallback.length > 0) {
    let decoded = rawCallback;

    try {
      decoded = decodeURIComponent(rawCallback);
    } catch {
      // ignore decoding issues and fall back to raw value
    }

    const normalized = normalizeRelativeUrl(decoded, baseUrl);

    if (normalized) {
      callbackUrl = normalized;
    }
  }

  return <AutoSignIn callbackUrl={callbackUrl} defaultCallbackUrl={configuredDefault} />;
}
