// Service Worker: optimized caching for media uploads with stale-while-revalidate
// - Caches ngrok /uploads/ responses for 24 hours
// - Uses stale-while-revalidate for instant loads
// - Automatically cleans up old caches

const CACHE_NAME = 'psa-uploads-v3';
const STALE_CACHE_NAME = 'psa-uploads-stale-v3';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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

// Clean up expired cache entries
async function cleanupExpiredCache() {
  const cache = await caches.open(STALE_CACHE_NAME);
  const requests = await cache.keys();
  const now = Date.now();
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader && (now - new Date(dateHeader).getTime()) > CACHE_TTL) {
        await cache.delete(request);
      }
    }
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Remove old caches from previous versions
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== STALE_CACHE_NAME).map((k) => caches.delete(k)))
      ),
      // Clean up expired entries
      cleanupExpiredCache()
    ]).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!isNgrokUploadsRequest(url, event.request.method)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(STALE_CACHE_NAME);
      const cached = await cache.match(event.request);
      
      // If we have a fresh cache hit, serve it immediately
      if (cached) {
        // Background refresh for next time
        fetchAndCache(event.request);
        return cached;
      }

      // Try network first
      try {
        const response = await fetch(event.request.url, {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' },
          mode: 'cors',
          credentials: 'omit',
        });

        if (response.ok) {
          // Cache successful responses
          const cacheToStore = await caches.open(CACHE_NAME);
          cacheToStore.put(event.request, response.clone());
          
          // Also store in stale cache for future
          const staleCache = await caches.open(STALE_CACHE_NAME);
          staleCache.put(event.request, response.clone());
        }
        
        return response;
      } catch (error) {
        // Network failed, try to serve from stale cache
        const staleResponse = await cache.match(event.request);
        if (staleResponse) {
          return staleResponse;
        }
        
        // Last resort: opaque fetch
        return fetch(event.request.url, {
          headers: { 'ngrok-skip-browser-warning': 'true' },
          mode: 'no-cors',
        });
      }
    })()
  );
});

// Background fetch and cache (non-blocking)
async function fetchAndCache(request) {
  try {
    const response = await fetch(request.url, {
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      mode: 'cors',
      credentials: 'omit',
    });

    if (response.ok) {
      const cache = await caches.open(STALE_CACHE_NAME);
      cache.put(request, response.clone());
    }
  } catch {
    // Ignore background refresh errors
  }
}
