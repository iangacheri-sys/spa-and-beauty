import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

// In production (Vercel) the Vite proxy isn't available, so point the shared
// API client at the deployed Railway API. VITE_API_URL is baked-in at build time.
// In local dev this is typically undefined (proxy handles routing via vite.config.ts).
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

setAuthTokenGetter(() => localStorage.getItem("admin_token"));

createRoot(document.getElementById("root")!).render(<App />);

