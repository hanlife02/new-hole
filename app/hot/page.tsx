import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { HotPageClient } from './HotPageClient';
import { HotHoleFilters } from '@/types';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_FILTERS: HotHoleFilters = {
  timeRange: '24h',
  sortBy: 'both',
  threshold: 20,
};

export default async function HotPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <HotPageClient initialFilters={{ ...DEFAULT_FILTERS }} />;
}
