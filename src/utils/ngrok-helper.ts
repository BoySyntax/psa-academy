// Helper utilities for ngrok integration

// Check if current URL is ngrok and add meta refresh to bypass warning
export const checkAndHandleNgrokWarning = () => {
  const url = new URL(window.location.href);
  const isNgrokHost = url.hostname.includes('.ngrok-');
  
  if (isNgrokHost && !url.searchParams.has('ngrok-skip')) {
    // Add meta refresh to bypass warning page
    const meta = document.createElement('meta');
    meta.httpEquiv = 'refresh';
    meta.content = '0; url=' + window.location.href + '?ngrok-skip=true';
    document.head.appendChild(meta);
  }
};

// Get the current ngrok URL from localStorage or environment
export const getCurrentNgrokUrl = (): string => {
  // Try to get from localStorage first (user might have set it)
  const stored = localStorage.getItem('ngrok_url');
  if (stored) return stored;
  
  // Fall back to environment variable
  return import.meta.env.VITE_API_BASE_URL || '';
};

// Set and persist ngrok URL
export const setNgrokUrl = (url: string) => {
  localStorage.setItem('ngrok_url', url);
};

// Normalize any URL to use current ngrok base
export const normalizeToNgrok = (url: string): string => {
  if (!url) return url;
  
  // If it's already an ngrok URL, return as-is
  if (url.includes('.ngrok-')) return url;
  
  // If it's a localhost URL, replace with current ngrok
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const ngrokBase = getCurrentNgrokUrl();
    if (ngrokBase) {
      return url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?/, ngrokBase);
    }
  }
  
  return url;
};

// Add ngrok headers to any fetch request
export const addNgrokHeaders = (init: RequestInit = {}): RequestInit => {
  const headers = new Headers(init.headers);
  headers.set('ngrok-skip-browser-warning', 'true');
  return { ...init, headers };
};
