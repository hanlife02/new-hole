import { normalizeRelativeUrl } from '@/lib/url';
import CallbackRedirect from './CallbackRedirect';

type CallbackPageProps = {
  searchParams?: {
    returnTo?: string;
  };
};

export const dynamic = 'force-dynamic';

function resolveReturnTo(raw: string | undefined, baseUrl?: string) {
  if (!raw || raw.length === 0) {
    return null;
  }

  let decoded = raw;

  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // ignore decoding issues and fall back to raw value
  }

  return normalizeRelativeUrl(decoded, baseUrl);
}

export default function CallbackPage({ searchParams }: CallbackPageProps) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const resolved = resolveReturnTo(searchParams?.returnTo, baseUrl);
  const target = resolved ?? '/';

  return <CallbackRedirect target={target} />;
}
