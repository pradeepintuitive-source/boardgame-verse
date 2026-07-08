import { create } from "zustand";
import type { MafiaState } from "../models";

interface GameState {
  mafia: Record<string, MafiaState>; // gameId -> state
  setMafia: (gameId: string, state: MafiaState) => void;
  patchMafia: (gameId: string, patch: Partial<MafiaState>) => void;
  clear: (gameId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  mafia: {},
  setMafia: (gameId, state) => set((s) => ({ mafia: { ...s.mafia, [gameId]: state } })),
  patchMafia: (gameId, patch) =>
    set((s) => {
      const cur = s.mafia[gameId];
      if (!cur) return s;
      return { mafia: { ...s.mafia, [gameId]: { ...cur, ...patch } } };
    }),
  clear: (gameId) =>
    set((s) => {
      const { [gameId]: _drop, ...rest } = s.mafia;
      return { mafia: rest };
    }),
}));
