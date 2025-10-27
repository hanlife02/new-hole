export function normalizeRelativeUrl(target: string | undefined, baseUrl?: string): string | null {
  if (!target) {
    return null;
  }

  const trimmed = target.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const absolute = new URL(trimmed);

    if (baseUrl) {
      const base = new URL(baseUrl);

      if (absolute.origin !== base.origin) {
        return null;
      }
    }

    return `${absolute.pathname}${absolute.search}${absolute.hash}`;
  } catch {
    if (!baseUrl) {
      return null;
    }

    try {
      const resolved = new URL(trimmed, baseUrl);
      const base = new URL(baseUrl);

      if (resolved.origin !== base.origin) {
        return null;
      }

      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch {
      return null;
    }
  }
}

export function buildCallbackPath(returnTo: string, fallback: string = '/'): string {
  const normalizedTarget = normalizeRelativeUrl(returnTo);

  if (normalizedTarget) {
    return normalizedTarget;
  }

  const normalizedFallback = normalizeRelativeUrl(fallback) ?? '/';

  return normalizedFallback;
}
