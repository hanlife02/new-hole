function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export function getApiKey(): string | null {
  return getCookie('apiKey');
}

export async function apiRequest(url: string, options: RequestInit = {}) {
  const apiKey = getApiKey();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-api-key': apiKey || '',
    },
  });
}