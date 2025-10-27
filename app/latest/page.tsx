import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LatestPageClient from './LatestPageClient';

export const dynamic = 'force-dynamic';

export default async function LatestPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <LatestPageClient />;
}
