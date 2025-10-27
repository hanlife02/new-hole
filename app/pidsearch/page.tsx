import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildCallbackPath } from '@/lib/url';
import PidSearchPageClient from './PidSearchPageClient';

export const dynamic = 'force-dynamic';

export default async function PidSearchPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    const callbackPath = buildCallbackPath('/pidsearch');
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return <PidSearchPageClient />;
}
