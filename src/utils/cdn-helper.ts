// CDN helper utilities for Cloudflare integration

// Check if we're using Cloudflare CDN
export const isCloudflareEnvironment = (): boolean => {
  return window.location.hostname.includes('cloudflare') || 
         document.cookie.includes('cf_worker') ||
         (window as any).CF;
};

// Get the base URL for API requests
export const getApiBaseUrl = (): string => {
  // Check if we have a custom domain through Cloudflare
  const hostname = window.location.hostname;
  
  // If using custom domain, use the same domain for API
  if (!hostname.includes('netlify.app')) {
    return `${window.location.protocol}//${hostname}/api`;
  }
  
  // Fallback to environment variable
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';
};

// Normalize URLs to work with Cloudflare
export const normalizeUrl = (url: string): string => {
  if (!url) return url;
  
  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL, make it absolute
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  
  // Otherwise, treat as relative to current domain
  return `${window.location.origin}/${url}`;
};

// Check if a URL should be cached by Cloudflare
export const shouldCacheUrl = (url: string): boolean => {
  const cacheablePatterns = [
    /\/uploads\//,
    /\.(css|js|png|jpg|jpeg|gif|webp|svg|pdf|mp4|avi|mov|mp3)$/i,
  ];
  
  return cacheablePatterns.some(pattern => pattern.test(url));
};

// Add Cloudflare-specific headers if needed
export const addCloudflareHeaders = (headers: HeadersInit = {}): HeadersInit => {
  // Cloudflare automatically handles most headers
  // Add any custom headers here if needed
  return headers;
};
