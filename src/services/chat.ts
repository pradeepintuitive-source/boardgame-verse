import { api } from "./api";

export interface ChatMessageResponse {
  id: string;
  roomId: string;
  senderUserId: string;
  targetUserId?: string | null;
  senderName: string;
  content: string;
  systemMessage: boolean;
  aiMessage: boolean;
  sentAt: string;
}

export const chatApi = {
  history: async (roomId: string): Promise<ChatMessageResponse[]> => {
    const { data } = await api.get<ChatMessageResponse[]>(`rooms/${roomId}/chat`);
    return data;
  },
  sendMessage: async (
    roomId: string,
    content: string,
    targetUserId?: string | null,
  ): Promise<ChatMessageResponse> => {
    const { data } = await api.post<ChatMessageResponse>(`rooms/${roomId}/chat`, {
      content,
      targetUserId,
    });
    return data;
  },
};
