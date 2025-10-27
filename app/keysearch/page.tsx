import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import KeySearchPageClient from './KeySearchPageClient';

export const dynamic = 'force-dynamic';

export default async function KeySearchPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <KeySearchPageClient />;
}
