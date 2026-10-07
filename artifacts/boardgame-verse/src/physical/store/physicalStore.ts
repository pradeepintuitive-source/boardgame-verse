import { create } from "zustand";
import { localGameRepository } from "../db/physicalDb";
import type { EngineResult, PhysicalGame } from "../types";
import type { GameSummary } from "../db/physicalDb";

const SAVE_ERROR = "Unable to save the game locally. Please export a backup before continuing.";

interface PhysicalStore {
  game: PhysicalGame | null;
  summaries: GameSummary[];
  loading: boolean;
  error: string | null;
  refreshList: () => Promise<void>;
  load: (id: string) => Promise<void>;
  adopt: (game: PhysicalGame) => Promise<boolean>;
  apply: (result: EngineResult) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePhysicalStore = create<PhysicalStore>((set, get) => ({
  game: null,
  summaries: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  refreshList: async () => {
    try {
      const summaries = await localGameRepository.list();
      set({ summaries });
    } catch {
      set({ error: "Unable to read saved games on this device." });
    }
  },
  load: async (id) => {
    if (get().game?.id === id) return;
    set({ loading: true, error: null });
    try {
      const game = await localGameRepository.load(id);
      if (!game) set({ loading: false, game: null, error: "That saved game is not on this device." });
      else set({ loading: false, game, error: null });
    } catch {
      set({ loading: false, game: null, error: "Unable to open the saved game on this device." });
    }
  },
  adopt: async (game) => {
    try {
      await localGameRepository.save(game);
      set({ game, error: null });
      await get().refreshList();
      return true;
    } catch {
      set({ error: SAVE_ERROR });
      return false;
    }
  },
  apply: async (result) => {
    if (!result.ok) {
      set({ error: result.error });
      return false;
    }
    try {
      await localGameRepository.save(result.state);
      set({ game: result.state, error: null });
      return true;
    } catch {
      set({ error: SAVE_ERROR });
      return false;
    }
  },
  remove: async (id) => {
    await localGameRepository.remove(id);
    if (get().game?.id === id) set({ game: null });
    await get().refreshList();
  },
}));
