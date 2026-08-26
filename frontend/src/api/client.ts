import { ApiError } from "@/types/api";
import { getAuthToken } from "@/lib/auth-token";
import { getApiBaseUrl } from "@/lib/app-env";

const API_BASE_URL = getApiBaseUrl();

type RequestOptions = RequestInit & {
  auth?: boolean;
};

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
    const token = getAuthToken();
    if (!token) {
      throw new ApiError("Not authorized to access this route", 401);
    }
    requestHeaders = {
      ...requestHeaders,
      Authorization: `Bearer ${token}`,
    };
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

