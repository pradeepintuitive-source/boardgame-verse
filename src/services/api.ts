import axios from "axios";

/**
 * Axios instance for REST calls to the GameHub backend.
 * Base URL is configurable via VITE_API_URL; defaults to /api.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 10_000,
  withCredentials: false,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Global error logger; UI surfaces toasts where needed.
    console.warn("[api]", err?.response?.status, err?.message);
    return Promise.reject(err);
  },
);