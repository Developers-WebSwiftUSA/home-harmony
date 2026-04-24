/** Resolves VITE_API_URL for same-origin (e.g. `/api`) vs absolute (e.g. `http://localhost:5000/api`). */

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw === "string" && raw.trim() !== "") {
    const trimmed = raw.trim().replace(/\/$/, "");
    if (trimmed.startsWith("/")) return trimmed || "/api";
    return trimmed;
  }
  if (import.meta.env.PROD) return "/api";
  return "http://localhost:5000/api";
}

/** Socket.IO base (no /api); uses current origin when API is relative or in production. */
export function getSocketOrigin(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw === "string" && raw.trim() !== "" && raw.trim().startsWith("/")) {
    if (typeof window !== "undefined") return window.location.origin;
    return "http://localhost:5000";
  }
  if (import.meta.env.PROD) {
    if (typeof window !== "undefined") return window.location.origin;
    return "http://localhost:5000";
  }
  const fallback =
    typeof raw === "string" && raw.trim() !== "" ? raw.trim() : "http://localhost:5000/api";
  return fallback.replace(/\/api\/?$/i, "").replace(/\/$/, "") || "http://localhost:5000";
}
