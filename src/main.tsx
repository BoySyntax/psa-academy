import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const _originalFetch = window.fetch.bind(window);
window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  
  // Only add ngrok header if we're actually using ngrok
  if (typeof input === 'string' && input.includes('ngrok')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  } else if (input instanceof URL && input.hostname.includes('ngrok')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }
  
  return _originalFetch(input, { ...init, headers });
};

// Register service worker based on environment
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use Cloudflare-optimized SW if not on ngrok
    const swFile = window.location.hostname.includes('ngrok') ? '/sw.js' : '/sw-cf.js';
    
    navigator.serviceWorker.register(swFile, {
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
