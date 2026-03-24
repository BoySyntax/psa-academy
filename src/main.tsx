import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const _originalFetch = window.fetch.bind(window);
window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('ngrok-skip-browser-warning', 'true');
  return _originalFetch(input, { ...init, headers });
};

// Register service worker to add ngrok-skip-browser-warning header
// to <img>, <video>, and other HTML-initiated resource requests.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
