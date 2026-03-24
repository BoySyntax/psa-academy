import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Cloudflare-optimized fetch - no special headers needed
// Cloudflare handles everything automatically

// Register Cloudflare-optimized service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-cf.js', {
      scope: '/'
    }).then((registration) => {
      console.log('Cloudflare SW registered: ', registration);
      
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
