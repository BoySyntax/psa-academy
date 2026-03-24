// Service Worker: adds ngrok-skip-browser-warning header to all
// cross-origin requests targeting ngrok tunnels so that <img>, <video>,
// and other HTML-initiated resource loads are not blocked by the
// ngrok interstitial page.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const isNgrok =
    url.hostname.endsWith('.ngrok-free.app') ||
    url.hostname.endsWith('.ngrok.io') ||
    url.hostname.endsWith('.ngrok.app');

  if (!isNgrok) return; // let the browser handle non-ngrok requests normally

  // Clone the request and add the bypass header
  const modifiedHeaders = new Headers(event.request.headers);
  modifiedHeaders.set('ngrok-skip-browser-warning', 'true');

  const modifiedRequest = new Request(event.request.url, {
    method: event.request.method,
    headers: modifiedHeaders,
    mode: 'cors',
    credentials: 'omit',
    redirect: 'follow',
  });

  event.respondWith(
    fetch(modifiedRequest).catch(() => {
      // If CORS fetch fails, fall back to an opaque response
      return fetch(event.request.url, {
        mode: 'no-cors',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
    })
  );
});
