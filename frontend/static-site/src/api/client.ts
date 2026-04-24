import { ApiError } from "@/types/api";

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim().replace(/\/$/, "") || "/api";
  }
  if (import.meta.env.PROD) return "/api";
  return "http://localhost:5000/api".replace(/\/$/, "");
}

const API_BASE_URL = resolveApiBaseUrl();

type RequestOptions = RequestInit & {
  auth?: boolean;
};

const getToken = () => localStorage.getItem("auth_token");

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, headers, ...rest } = options;

  let requestHeaders: HeadersInit = {
    ...headers,
  };

  // Do not set JSON content-type for FormData uploads.
  if (!(rest.body instanceof FormData)) {
    requestHeaders = {
      "Content-Type": "application/json",
      ...requestHeaders,
    };
  }

  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders = {
        ...requestHeaders,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(payload?.message || "Request failed", response.status);
  }

  return payload as T;
}

