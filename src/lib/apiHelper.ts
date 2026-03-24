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

export const getImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
    try {
      const apiOrigin = new URL(API_BASE_URL).origin;
      return url.replace(/^http:\/\/(localhost|127\.0\.0\.1)/, apiOrigin);
    } catch {
      return url;
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
