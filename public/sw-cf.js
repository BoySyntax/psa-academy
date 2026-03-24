// Service Worker for Cloudflare deployment
// Optimized for CDN caching with Cloudflare

const CACHE_NAME = 'psa-academy-v1';
const STATIC_CACHE = 'psa-static-v1';
const MEDIA_CACHE = 'psa-media-v1';

// Cache durations
const STATIC_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const MEDIA_TTL = 7 * 24 * 60 * 60 * 1000;   // 7 days

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Cache critical static files
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
      ]);
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== MEDIA_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and external requests
  if (event.request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE, STATIC_TTL));
  } else if (isMediaAsset(url)) {
    event.respondWith(staleWhileRevalidate(event.request, MEDIA_CACHE, MEDIA_TTL));
  } else if (isApiRequest(url)) {
    // Don't cache API requests through SW - let Cloudflare handle it
    return;
  } else {
    // For HTML pages, use network first
    event.respondWith(networkFirst(event.request));
  }
});

// Helper functions
function isStaticAsset(url) {
  return /\.(css|js|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

function isMediaAsset(url) {
  return /\/uploads\//i.test(url.pathname) || 
         /\.(png|jpg|jpeg|gif|webp|svg|pdf|mp4|avi|mov|mp3)$/i.test(url.pathname);
}

function isApiRequest(url) {
  return /\/api\//i.test(url.pathname);
}

// Cache strategies
async function cacheFirst(request, cacheName, ttl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached && !isExpired(cached, ttl)) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName, ttl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Always try to fetch fresh version
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  // Return cached version if available
  if (cached && !isExpired(cached, ttl)) {
    fetchPromise; // Fire and forget
    return cached;
  }
  
  // Otherwise wait for fresh version
  return fetchPromise;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

function isExpired(response, ttl) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  
  const responseDate = new Date(dateHeader);
  return Date.now() - responseDate.getTime() > ttl;
}
