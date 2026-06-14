import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  sfxVolume: number;
  musicVolume: number;
  reducedMotion: boolean;
  showLatency: boolean;
  set: <K extends keyof Omit<SettingsState, "set">>(k: K, v: SettingsState[K]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sfxVolume: 0.7,
      musicVolume: 0.4,
      reducedMotion: false,
      showLatency: true,
      set: (k, v) => set({ [k]: v } as any),
    }),
    { name: "gamehub.settings" },
  ),
);