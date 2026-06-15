import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MonopolyState } from "../models/monopoly";

interface Store {
  games: Record<string, MonopolyState>;
  setGame: (id: string, s: MonopolyState) => void;
  patch: (id: string, fn: (s: MonopolyState) => MonopolyState) => void;
  clear: (id: string) => void;
}

export const useMonopolyStore = create<Store>()(
  persist(
    (set) => ({
      games: {},
      setGame: (id, s) => set((st) => ({ games: { ...st.games, [id]: s } })),
      patch: (id, fn) =>
        set((st) => {
          const cur = st.games[id];
          if (!cur) return st;
          return { games: { ...st.games, [id]: fn(cur) } };
        }),
      clear: (id) =>
        set((st) => {
          const { [id]: _drop, ...rest } = st.games;
          return { games: rest };
        }),
    }),
    { name: "gh-monopoly" },
  ),
);