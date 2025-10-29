import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildCallbackPath } from '@/lib/url';
import KeySearchPageClient from './KeySearchPageClient';
import { RECENT_HOLE_LIMIT } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function KeySearchPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    const callbackPath = buildCallbackPath('/keysearch');
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return <KeySearchPageClient recentHoleLimit={RECENT_HOLE_LIMIT} />;
}
