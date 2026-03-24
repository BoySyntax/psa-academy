// Service Worker: intercepts ONLY static media (images, videos, PDFs)
// requests to ngrok /uploads/ paths and adds the bypass header so the
// ngrok interstitial page is skipped for <img>, <video>, <a> etc.
// API calls are NOT intercepted here (they use the window.fetch interceptor).
// Responses are cached so repeated loads are instant.

const CACHE_NAME = 'psa-uploads-v2';

// Only match GET requests to ngrok hosts for the /uploads/ path
function isNgrokUploadsRequest(url, method) {
  if (method !== 'GET') return false;
  const isNgrok =
    url.hostname.endsWith('.ngrok-free.app') ||
    url.hostname.endsWith('.ngrok.io') ||
    url.hostname.endsWith('.ngrok.app');
  const isUploads = url.pathname.includes('/uploads/');
  return isNgrok && isUploads;
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remove old caches from previous versions
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!isNgrokUploadsRequest(url, event.request.method)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        if (cached) return cached; // serve from cache immediately

        return fetch(url.href, {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' },
          mode: 'cors',
          credentials: 'omit',
        }).then((response) => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() =>
          // Fallback: opaque fetch (still skips interstitial via header)
          fetch(url.href, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
            mode: 'no-cors',
          })
        );
      })
    )
  );
});
