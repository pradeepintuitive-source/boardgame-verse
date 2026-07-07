import { create } from "zustand";
import type { User } from "../models";

/**
 * Auth state slice. Session is owned by AuthProvider (which talks to the
 * real backend via services/auth.ts) — this store is only a shared
 * subscription point so components can read the current user without
 * threading context. Do NOT persist here: the JWT in localStorage is the
 * source of truth, and AuthProvider rehydrates on mount.
 */
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  updateProfile: (patch) =>
    set((s) => ({ user: s.user ? { ...s.user, ...patch } : null })),
}));