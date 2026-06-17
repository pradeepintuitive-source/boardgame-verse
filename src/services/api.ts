import axios, { AxiosError } from "axios";

/**
 * Axios instance for REST calls to the GameHub Spring Boot backend.
 * Base URL is configurable via VITE_API_URL.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

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
  (r) => r,
  (err: AxiosError) => {
    const status = err.response?.status;
    if (status === 401) {
      tokenStore.clear();
      onUnauthorized?.();
    }
    console.warn("[api]", status, err.message);
    return Promise.reject(err);
  },
);

export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? err.message;
  }
  return err instanceof Error ? err.message : "Unknown error";
}