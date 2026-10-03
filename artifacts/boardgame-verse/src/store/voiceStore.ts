import { create } from "zustand";

export interface VoiceParticipant {
  userId: string;
  muted: boolean;
  speaking: boolean;
}

interface VoiceStore {
  joined: boolean;
  selfMuted: boolean;
  participants: Record<string, VoiceParticipant>;
  setJoined: (joined: boolean) => void;
  setSelfMuted: (muted: boolean) => void;
  setParticipants: (ids: string[]) => void;
  addParticipant: (userId: string) => void;
  removeParticipant: (userId: string) => void;
  setParticipantMute: (userId: string, muted: boolean) => void;
  setParticipantSpeaking: (userId: string, speaking: boolean) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  joined: false,
  selfMuted: true,
  participants: {},
  setJoined: (joined) => set({ joined }),
  setSelfMuted: (muted) => set({ selfMuted: muted }),
  setParticipants: (ids) =>
    set((state) => ({
      participants: Object.fromEntries(
        ids.map((id) => [
          id,
          state.participants[id] ?? { userId: id, muted: true, speaking: false },
        ]),
      ),
    })),
  addParticipant: (userId) =>
    set((state) => ({
      participants: {
        ...state.participants,
        [userId]: { userId, muted: true, speaking: false },
      },
    })),
  removeParticipant: (userId) =>
    set((state) => {
      const next = { ...state.participants };
      delete next[userId];
      return { participants: next };
    }),
  setParticipantMute: (userId, muted) =>
    set((state) => ({
      participants: {
        ...state.participants,
        [userId]: {
          ...(state.participants[userId] ?? { userId, muted: false, speaking: false }),
          userId,
          muted,
        },
      },
    })),
  setParticipantSpeaking: (userId, speaking) =>
    set((state) => ({
      participants: {
        ...state.participants,
        [userId]: {
          ...(state.participants[userId] ?? { userId, muted: false, speaking: false }),
          userId,
          speaking,
        },
      },
    })),
  reset: () => set({ joined: false, selfMuted: true, participants: {} }),
}));
