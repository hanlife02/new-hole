import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildCallbackPath } from '@/lib/url';
import LatestPageClient from './LatestPageClient';

export const dynamic = 'force-dynamic';

export default async function LatestPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    const callbackPath = buildCallbackPath('/latest');
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return <LatestPageClient />;
}
