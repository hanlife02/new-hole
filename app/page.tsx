import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildCallbackPath } from '@/lib/url';
import HomePageClient from './home/HomePageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    const callbackPath = buildCallbackPath('/');
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return <HomePageClient />;
}
