export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';

export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export const parseJsonResponse = async (response: Response) => {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : null;
  } catch {
    return null;
  }
};

const isLocalhostUrl = (u: string) =>
  u.startsWith('http://localhost') || u.startsWith('http://127.0.0.1');

export const getImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (isLocalhostUrl(url)) {
    try {
      const apiOrigin = new URL(API_BASE_URL).origin;
      // If the configured API base is also localhost (VITE_API_BASE_URL not set)
      // and the app is running from a deployed origin, we cannot load the image —
      // return null so components show their fallback instead of a blocked request.
      if (isLocalhostUrl(apiOrigin + '/')) {
        const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
        if (!isLocalhostUrl(appOrigin + '/')) return null;
      }
      return url.replace(/^http:\/\/(localhost|127\.0\.0\.1)/, apiOrigin);
    } catch {
      return null;
    }
  }
  return url;
};

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const headers = {
    ...DEFAULT_HEADERS,
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { ...options, headers });
  return parseJsonResponse(response);
};
