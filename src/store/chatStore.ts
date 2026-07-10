import { create } from "zustand";
import type { ChatMessage } from "../models";
import type { ChatMessageResponse } from "../services/chat";
import { chatApi } from "../services/chat";
import { pickAvatarColor } from "../utils/ids";

interface ChatState {
  messages: Record<string, ChatMessage[]>; // roomId -> msgs
  typing: Record<string, string[]>; // roomId -> usernames
  drawerOpen: boolean;
  unread: Record<string, number>;
  send: (roomId: string, content: string) => Promise<void>;
  loadHistory: (roomId: string) => Promise<void>;
  receiveMessage: (roomId: string, msg: ChatMessageResponse) => void;
  toggleDrawer: () => void;
  clearUnread: (roomId: string) => void;
  setTyping: (roomId: string, usernames: string[]) => void;
}

function mapChatResponse(roomId: string, response: ChatMessageResponse): ChatMessage {
  return {
    id: response.id,
    roomId,
    userId: response.senderUserId,
    username: response.senderName,
    avatarColor: pickAvatarColor(response.senderName),
    text: response.content,
    ts: new Date(response.sentAt).getTime(),
    channel: "public",
  };
}

function dedupeMessages(existing: ChatMessage[], next: ChatMessage): ChatMessage[] {
  if (existing.some((message) => message.id === next.id)) {
    return existing;
  }
  return [...existing, next];
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  typing: {},
  drawerOpen: false,
  unread: {},
  send: async (roomId, content) => {
    const response = await chatApi.sendMessage(roomId, content, null);
    const next = mapChatResponse(roomId, response);
    set((s) => ({
      messages: { ...s.messages, [roomId]: dedupeMessages(s.messages[roomId] ?? [], next) },
    }));
  },
  loadHistory: async (roomId) => {
    const history = await chatApi.history(roomId);
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: history.reduce<ChatMessage[]>((acc, message) => {
          const next = mapChatResponse(roomId, message);
          return dedupeMessages(acc, next);
        }, s.messages[roomId] ?? []),
      },
    }));
  },
  receiveMessage: (roomId, msg) =>
    set((s) => {
      const next = mapChatResponse(roomId, msg);
      const list = dedupeMessages(s.messages[roomId] ?? [], next);
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
