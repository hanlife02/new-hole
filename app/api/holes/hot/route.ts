import { NextRequest, NextResponse } from 'next/server';
import { fetchHotHoles } from '@/lib/hotHoles';
import { HotHoleFilters } from '@/types';

const TIME_RANGES: HotHoleFilters['timeRange'][] = ['24h', '3d', '7d'];
const SORT_OPTIONS: HotHoleFilters['sortBy'][] = ['star', 'reply', 'both'];

function parseNumber(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const timeRangeParam = searchParams.get('timeRange');
    const sortByParam = searchParams.get('sortBy');
    const thresholdParam = searchParams.get('threshold');

    const filters: HotHoleFilters = {
      timeRange: TIME_RANGES.includes(timeRangeParam as HotHoleFilters['timeRange'])
        ? (timeRangeParam as HotHoleFilters['timeRange'])
        : '24h',
      sortBy: SORT_OPTIONS.includes(sortByParam as HotHoleFilters['sortBy'])
        ? (sortByParam as HotHoleFilters['sortBy'])
        : 'both',
      threshold: parseNumber(thresholdParam, 20),
    };

    const offset = Math.max(0, parseNumber(searchParams.get('offset'), 0));
    const limit = Math.max(1, parseNumber(searchParams.get('limit'), 20));

    const result = await fetchHotHoles(filters, { offset, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取热点树洞失败:', error);
    return NextResponse.json(
      { error: '获取热点树洞失败' },
      { status: 500 },
    );
  }
}
