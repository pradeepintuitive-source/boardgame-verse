import { api, tokenStore } from "./api";
import type { User } from "../models";

/**
 * Auth service — maps to Spring Boot /api/auth/** endpoints.
 * Public: /register, /login, /guest. Protected: /me, /refresh, /logout.
 */

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  user: User;
}

interface RawAuthResponse extends Partial<AuthResponse> {
  token?: string;
  jwt?: string;
  access_token?: string;
  refresh_token?: string;
  username?: string;
  id?: string;
  email?: string;
  avatarColor?: string;
  isGuest?: boolean;
  guest?: boolean;
  user?: User;
}

interface RawMeResponse {
  id?: string;
  userId?: string;
  username?: string;
  email?: string;
  avatarColor?: string;
  isGuest?: boolean;
  guest?: boolean;
}

function normalize(raw: RawAuthResponse): AuthResponse {
  const accessToken = raw.accessToken ?? raw.token ?? raw.jwt ?? raw.access_token ?? "";
  const refreshToken = raw.refreshToken ?? raw.refresh_token;
  const user: User =
    raw.user ??
    ({
      id: raw.id ?? "",
      username: raw.username ?? "",
      email: raw.email,
      avatarColor: raw.avatarColor ?? "#7c3aed",
      isGuest: raw.isGuest ?? raw.guest ?? false,
    } as User);
  return { accessToken, refreshToken, user };
}

function normalizeMe(raw: RawMeResponse): User {
  return {
    id: raw.id ?? raw.userId ?? "",
    username: raw.username ?? "",
    email: raw.email,
    avatarColor: raw.avatarColor ?? "#7c3aed",
    isGuest: raw.isGuest ?? raw.guest ?? false,
  };
}

function persist(res: AuthResponse) {
  if (res.accessToken) tokenStore.set(res.accessToken);
  if (res.refreshToken) tokenStore.setRefresh(res.refreshToken);
}

export const authApi = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<RawAuthResponse>("auth/login", {
      username,
      password,
    });
    const res = normalize(data);
    persist(res);
    return res;
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<RawAuthResponse>("auth/register", {
      username,
      email,
      password,
    });
    const res = normalize(data);
    persist(res);
    return res;
  },

  async guest(username: string): Promise<AuthResponse> {
    const { data } = await api.post<RawAuthResponse>("auth/guest", {
      username,
    });
    const res = normalize(data);
    persist(res);
    return res;
  },

  async me(): Promise<User> {
    const { data } = await api.get<RawMeResponse>("auth/me");
    return normalizeMe(data);
  },

  async refresh(): Promise<AuthResponse | null> {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) return null;
    const { data } = await api.post<RawAuthResponse>("auth/refresh", {
      refreshToken,
    });
    const res = normalize(data);
    persist(res);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await api.post("auth/logout");
    } catch {
      /* ignore — clear local state regardless */
    }
    tokenStore.clear();
  },
};
