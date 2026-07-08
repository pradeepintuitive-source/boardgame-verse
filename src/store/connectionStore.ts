import { create } from "zustand";
import type { ConnectionState } from "../models";
import { stomp } from "../websocket/stompClient";

interface ConnStore extends ConnectionState {
  roomId: string | null;
  setRoom: (id: string | null) => void;
  init: () => void;
}

export const useConnectionStore = create<ConnStore>((set) => {
  let initialised = false;
  return {
    connected: false,
    reconnecting: false,
    lastError: null,
    latencyMs: 24,
    roomId: null,
    setRoom: (id) => set({ roomId: id }),
    init: () => {
      if (initialised) return;
      initialised = true;
      stomp.onStatus((connected, reconnecting) => set({ connected, reconnecting }));
      stomp.connect();
    },
  };
});
