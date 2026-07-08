import axios, { AxiosError } from "axios";
import { toast } from "sonner";

/**
 * Axios instance for REST calls to the GameHub Spring Boot backend.
 * Base URL is configurable via VITE_API_URL.
 *
 * Backend response contract:
 *   Success: { timestamp, status, message, data, details, path }
 *   Error:   { timestamp, status, error, message, details, path }
 *
 * A response interceptor unwraps `response.data.data` so all service call
 * sites can keep using `response.data` as the payload. Errors are
 * normalized into `ApiError` and surfaced via toast.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export const TOKEN_STORAGE_KEY = "gh.jwt";
export const REFRESH_STORAGE_KEY = "gh.jwt.refresh";

export const tokenStore = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  set: (token: string | null) => {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
  getRefresh: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  },
  setRefresh: (token: string | null) => {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(REFRESH_STORAGE_KEY, token);
    else localStorage.removeItem(REFRESH_STORAGE_KEY);
  },
  clear: () => {
    tokenStore.set(null);
    tokenStore.setRefresh(null);
  },
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    // ngrok free tier interstitial bypass — harmless against any other host
    "ngrok-skip-browser-warning": "true",
  },
});

// -----------------------------------------------------------------------------
// Response contract
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  data: T;
  details?: string[];
  path: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details?: string[];
  path: string;
}

export class ApiError extends Error {
  status: number;
  error: string;
  details: string[];
  path?: string;
  constructor(init: {
    message: string;
    status: number;
    error?: string;
    details?: string[];
    path?: string;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.error = init.error ?? "Error";
    this.details = init.details ?? [];
    this.path = init.path;
  }
}

function isApiResponse(body: unknown): body is ApiResponse<unknown> {
  return (
    !!body &&
    typeof body === "object" &&
    "status" in (body as Record<string, unknown>) &&
    "data" in (body as Record<string, unknown>) &&
    "path" in (body as Record<string, unknown>)
  );
}

// Attach bearer token on every request
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(cb: () => void) {
  onUnauthorized = cb;
}

api.interceptors.response.use(
  (r) => {
    // Unwrap ApiResponse<T> so services can keep reading `response.data`
    // as the payload. Void endpoints yield `null`.
    if (isApiResponse(r.data)) {
      const wrapped = r.data as ApiResponse<unknown>;
      if (wrapped.details && wrapped.details.length > 0) {
        console.info("[api]", r.config.url, wrapped.message, wrapped.details);
      }
      const method = (r.config.method ?? "get").toLowerCase();
      const silent = r.config.headers?.["X-Silent-Toast"] === "true";
      if (
        !silent &&
        method !== "get" &&
        wrapped.message &&
        wrapped.message.toLowerCase() !== "ok"
      ) {
        toast.success(wrapped.message);
      }
      r.data = wrapped.data as never;
    }
    return r;
  },
  (err: AxiosError) => {
    const status = err.response?.status;
    const body = err.response?.data as Partial<ErrorResponse> | undefined;
    const message =
      body?.message ?? body?.error ?? err.message ?? "Request failed";
    const details = body?.details ?? [];

    if (status === 401) {
      tokenStore.clear();
      onUnauthorized?.();
    }

    console.warn("[api]", status, message, details);

    const apiError = new ApiError({
      message,
      status: status ?? 0,
      error: body?.error,
      details,
      path: body?.path,
    });

    // Global toast — silence 401s (handled by auth flow) and network aborts.
    if (status && status !== 401) {
      toast.error(body?.error ?? "Request failed", {
        description:
          details.length > 0 ? details.join("\n") : message,
      });
    } else if (!err.response) {
      toast.error("Network error", { description: err.message });
    }

    return Promise.reject(apiError);
  },
);

export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.details.length > 0
      ? `${err.message}: ${err.details.join(", ")}`
      : err.message;
  }
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Partial<ErrorResponse> | undefined;
    return data?.message ?? data?.error ?? err.message;
  }
  return err instanceof Error ? err.message : "Unknown error";
}

export function apiErrorDetails(err: unknown): string[] {
  if (err instanceof ApiError) return err.details;
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Partial<ErrorResponse> | undefined;
    return data?.details ?? [];
  }
  return [];
}
