import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const _originalFetch = window.fetch.bind(window);
window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('ngrok-skip-browser-warning', 'true');
  return _originalFetch(input, { ...init, headers });
};

createRoot(document.getElementById("root")!).render(<App />);
