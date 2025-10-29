const DEFAULT_RECENT_HOLE_LIMIT = 10_000;

function parseLimit(rawValue: string | undefined) {
  if (!rawValue) {
    return DEFAULT_RECENT_HOLE_LIMIT;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_RECENT_HOLE_LIMIT;
  }

  return parsed;
}

export const RECENT_HOLE_LIMIT = parseLimit(
  process.env.RECENT_HOLE_LIMIT ?? process.env.NEXT_PUBLIC_RECENT_HOLE_LIMIT,
);
