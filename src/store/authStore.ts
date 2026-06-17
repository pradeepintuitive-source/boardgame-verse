import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../models";
import { pickAvatarColor, uid } from "../utils/ids";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  loginGuest: (username: string) => void;
  login: (username: string, _password: string) => Promise<void>;
  register: (username: string, email: string, _password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      loginGuest: (username) =>
        set({
          user: {
            id: uid("usr"),
            username,
            avatarColor: pickAvatarColor(username),
            isGuest: true,
          },
        }),
      login: async (username, _password) => {
        // TODO: wire to /auth/login via api.ts
        await new Promise((r) => setTimeout(r, 300));
        set({
          user: {
            id: uid("usr"),
            username,
            avatarColor: pickAvatarColor(username),
            isGuest: false,
          },
        });
      },
      register: async (username, email, _password) => {
        await new Promise((r) => setTimeout(r, 300));
        set({
          user: {
            id: uid("usr"),
            username,
            email,
            avatarColor: pickAvatarColor(username),
            isGuest: false,
          },
        });
      },
      logout: () => set({ user: null }),
      updateProfile: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : null })),
    }),
    { name: "gamehub.auth" },
  ),
);