import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../services/auth";
import { setUnauthorizedHandler, tokenStore } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { stomp } from "../websocket/stompClient";
import type { User } from "../models";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginGuest: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(true);

  // Rehydrate from token on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = tokenStore.get();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        tokenStore.clear();
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, clear]);

  // Connect STOMP after login; disconnect on logout.
  // Uses a ref to track whether we've already connected to avoid calling
  // reconnect() (which internally disconnects first) on every user change.
  const prevUserRef = useRef<User | null>(null);
  useEffect(() => {
    const prev = prevUserRef.current;
    prevUserRef.current = user;
    if (user && !prev) {
      // Newly logged in — open connection for the first time.
      stomp.connect();
    } else if (user && prev && prev.id !== user.id) {
      // User switched (rare) — reconnect with fresh token.
      stomp.reconnect();
    } else if (!user && prev) {
      // Logged out — close connection.
      stomp.disconnect();
    }
  }, [user]);

  // Global 401 -> sign out
  useEffect(() => {
    setUnauthorizedHandler(() => clear());
  }, [clear]);

  const login = useCallback(
    async (username: string, password: string) => {
      const { user } = await authApi.login(username, password);
      setUser(user);
    },
    [setUser],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const { user } = await authApi.register(username, email, password);
      setUser(user);
    },
    [setUser],
  );

  const loginGuest = useCallback(
    async (username: string) => {
      const { user } = await authApi.guest(username);
      setUser({ ...user, isGuest: true });
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    clear();
  }, [clear]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, loginGuest, logout }),
    [user, loading, login, register, loginGuest, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
