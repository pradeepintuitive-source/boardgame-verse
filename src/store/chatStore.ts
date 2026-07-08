import { create } from "zustand";
import type { ChatMessage } from "../models";
import { uid } from "../utils/ids";

interface ChatState {
  messages: Record<string, ChatMessage[]>; // roomId -> msgs
  typing: Record<string, string[]>; // roomId -> usernames
  drawerOpen: boolean;
  unread: Record<string, number>;
  send: (roomId: string, msg: Omit<ChatMessage, "id" | "ts" | "roomId">) => void;
  toggleDrawer: () => void;
  clearUnread: (roomId: string) => void;
  setTyping: (roomId: string, usernames: string[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  typing: {},
  drawerOpen: false,
  unread: {},
  send: (roomId, msg) =>
    set((s) => {
      const next: ChatMessage = { ...msg, id: uid("m"), roomId, ts: Date.now() };
      const list = [...(s.messages[roomId] ?? []), next];
      const unread = s.drawerOpen
        ? s.unread
        : { ...s.unread, [roomId]: (s.unread[roomId] ?? 0) + 1 };
      return { messages: { ...s.messages, [roomId]: list }, unread };
    }),
  toggleDrawer: () =>
    set((s) => ({ drawerOpen: !s.drawerOpen, unread: !s.drawerOpen ? {} : s.unread })),
  clearUnread: (roomId) => set((s) => ({ unread: { ...s.unread, [roomId]: 0 } })),
  setTyping: (roomId, usernames) => set((s) => ({ typing: { ...s.typing, [roomId]: usernames } })),
}));
