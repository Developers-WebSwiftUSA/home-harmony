import { ApiError } from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

