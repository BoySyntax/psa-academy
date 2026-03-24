import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const _originalFetch = window.fetch.bind(window);
window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('ngrok-skip-browser-warning', 'true');
  return _originalFetch(input, { ...init, headers });
};

// Register service worker to bypass ngrok warning page and cache media
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    }).then((registration) => {
      console.log('SW registered: ', registration);
      
      // Force update service worker on new versions
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available, refresh to activate
              window.location.reload();
            }
          });
        }
      });
    }).catch((error) => {
      console.error('SW registration failed: ', error);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
