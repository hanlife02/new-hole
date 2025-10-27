import { HotPageClient } from './HotPageClient';
import { fetchHotHoles } from '@/lib/hotHoles';
import { HotHoleFilters } from '@/types';

export const dynamic = 'force-dynamic';

const DEFAULT_FILTERS: HotHoleFilters = {
  timeRange: '24h',
  sortBy: 'both',
  threshold: 20,
};

export default async function HotPage() {
  const initialFilters: HotHoleFilters = { ...DEFAULT_FILTERS };

  try {
    const initialData = await fetchHotHoles(initialFilters, {
      offset: 0,
      limit: 20,
    });

    return <HotPageClient initialFilters={initialFilters} initialData={initialData} />;
  } catch (error) {
    console.error('获取热点树洞失败:', error);

    return (
      <HotPageClient
        initialFilters={initialFilters}
        initialData={{ holes: [], total: 0, hasMore: false }}
      />
    );
  }
}
