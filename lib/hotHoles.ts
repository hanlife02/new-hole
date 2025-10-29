import pool from '@/lib/db';
import { RECENT_HOLE_LIMIT } from '@/lib/constants';
import { Comment, Hole, HoleWithComments, HotHoleFilters } from '@/types';

interface HotHoleQueryOptions {
  offset?: number;
  limit?: number;
  includeComments?: boolean;
}

interface HotHoleQueryResult {
  holes: HoleWithComments[];
  total: number;
  hasMore: boolean;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

type TimeRange = HotHoleFilters['timeRange'];
type SortBy = HotHoleFilters['sortBy'];

function resolveTimeBoundary(range: TimeRange): Date | null {
  const now = Date.now();

  switch (range) {
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000);
    case '3d':
      return new Date(now - 3 * 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

function normalizeFilters(filters: HotHoleFilters): HotHoleFilters {
  const timeRange: TimeRange = ['24h', '3d', '7d'].includes(filters.timeRange)
    ? filters.timeRange
    : '24h';

  const sortBy: SortBy = ['star', 'reply', 'both'].includes(filters.sortBy)
    ? filters.sortBy
    : 'both';

  const threshold = Number.isFinite(filters.threshold)
    ? Math.max(0, Math.floor(filters.threshold))
    : 0;

  return { timeRange, sortBy, threshold };
}

type HoleRow = Omit<Hole, 'created_at' | 'updated_at'> & {
  created_at: Date | string;
  updated_at: Date | string;
};

type CommentRow = Omit<Comment, 'created_at'> & {
  created_at: Date | string;
};

function serializeHole(row: HoleRow): Hole {
  return {
    ...row,
    created_at:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at:
      row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

function serializeComment(row: CommentRow): Comment {
  return {
    ...row,
    created_at:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function getOrdering(sortBy: SortBy) {
  switch (sortBy) {
    case 'star':
      return 'ORDER BY h.likenum DESC, h.created_at DESC';
    case 'reply':
      return 'ORDER BY h.reply DESC, h.created_at DESC';
    case 'both':
    default:
      return 'ORDER BY (h.likenum + h.reply) DESC, h.created_at DESC';
  }
}

function buildThresholdCondition(sortBy: SortBy, placeholder: string) {
  switch (sortBy) {
    case 'star':
      return `h.likenum >= ${placeholder}`;
    case 'reply':
      return `h.reply >= ${placeholder}`;
    case 'both':
    default:
      return `(h.likenum + h.reply) >= ${placeholder}`;
  }
}

export async function fetchHotHoles(
  filters: HotHoleFilters,
  options: HotHoleQueryOptions = {},
): Promise<HotHoleQueryResult> {
  const normalizedFilters = normalizeFilters(filters);
  const offset = Math.max(0, options.offset ?? 0);
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const includeComments = options.includeComments ?? false;

  const conditions: string[] = [];
  const conditionParams: Array<string | number | Date> = [];
  let placeholderIndex = 1;

  if (normalizedFilters.threshold > 0) {
    conditions.push(buildThresholdCondition(normalizedFilters.sortBy, `$${placeholderIndex}`));
    conditionParams.push(normalizedFilters.threshold);
    placeholderIndex += 1;
  }

  const timeBoundary = resolveTimeBoundary(normalizedFilters.timeRange);
  if (timeBoundary) {
    conditions.push(`h.created_at >= $${placeholderIndex}`);
    conditionParams.push(timeBoundary);
    placeholderIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = getOrdering(normalizedFilters.sortBy);

  const baseQuery = `
    WITH recent_holes AS (
      SELECT *
      FROM holes
      ORDER BY created_at DESC
      LIMIT ${RECENT_HOLE_LIMIT}
    )
  `;

  const holesQuery = `
    ${baseQuery}
    SELECT h.*
    FROM recent_holes h
    ${whereClause}
    ${orderClause}
    LIMIT $${conditionParams.length + 1}
    OFFSET $${conditionParams.length + 2}
  `;

  const holesParams = [...conditionParams, limit, offset];

  const countQuery = `
    ${baseQuery}
    SELECT COUNT(*)::int AS total
    FROM recent_holes h
    ${whereClause}
  `;

  const [holesResult, countResult] = await Promise.all([
    pool.query(holesQuery, holesParams),
    pool.query(countQuery, conditionParams),
  ]);

  const holes = holesResult.rows.map(serializeHole);
  const total: number = countResult.rows[0]?.total ?? 0;

  if (holes.length === 0) {
    return { holes: [], total, hasMore: false };
  }

  if (!includeComments) {
    const holesWithoutComments: HoleWithComments[] = holes.map((hole) => ({
      ...hole,
      comments: [],
    }));

    return {
      holes: holesWithoutComments,
      total,
      hasMore: offset + holes.length < total,
    };
  }

  const holePids = holes.map((hole) => hole.pid);
  const commentsResult = await pool.query(
    `
      SELECT *
      FROM comments
      WHERE pid = ANY($1::int[])
      ORDER BY created_at ASC
    `,
    [holePids],
  );

  const commentsByPid = new Map<number, Comment[]>();
  for (const row of commentsResult.rows) {
    const comment = serializeComment(row);
    const existing = commentsByPid.get(comment.pid) ?? [];
    existing.push(comment);
    commentsByPid.set(comment.pid, existing);
  }

  const holesWithComments: HoleWithComments[] = holes.map((hole) => ({
    ...hole,
    comments: commentsByPid.get(hole.pid) ?? [],
  }));

  return {
    holes: holesWithComments,
    total,
    hasMore: offset + holes.length < total,
  };
}
