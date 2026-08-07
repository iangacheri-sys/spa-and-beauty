import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

// In production (Vercel) the Vite proxy isn't available, so point the shared
// API client at the deployed Railway API. VITE_API_URL is baked-in at build time.
// In local dev this is typically undefined (proxy handles routing via vite.config.ts).
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (rawApiUrl) {
  // Strip trailing /api or /api/ to prevent /api/api/ routes
  const apiUrl = rawApiUrl.replace(/\/api\/?$/, '');
  setBaseUrl(apiUrl);
  
  // Override native fetch to automatically prepend VITE_API_URL for relative /api calls.
  // This ensures all hardcoded fetch('/api/...') calls work in production on Vercel.
  const originalFetch = window.fetch;
  window.fetch = async (resource, config) => {
    if (typeof resource === 'string' && resource.startsWith('/api')) {
      resource = `${apiUrl}${resource}`;
    }
    return originalFetch(resource, config);
  };
}

setAuthTokenGetter(() => localStorage.getItem("admin_token"));

createRoot(document.getElementById("root")!).render(<App />);

