import { api } from "./api";
import type { GameType, Room } from "../models";

export interface CreateRoomRequest {
  name: string;
  gameType: GameType;
  maxPlayers: number;
  aiPlayerCount?: number;
  isPrivate?: boolean;
}

export const roomsApi = {
  list: async (gameType?: GameType): Promise<Room[]> => {
    const { data } = await api.get<Room[]>("/api/rooms", {
      params: gameType ? { gameType } : undefined,
    });
    return data;
  },
  get: async (roomId: string): Promise<Room> => {
    const { data } = await api.get<Room>(`/api/rooms/${roomId}`);
    return data;
  },
  create: async (req: CreateRoomRequest): Promise<Room> => {
    const { data } = await api.post<Room>("/api/rooms", req);
    return data;
  },
  join: async (roomId: string): Promise<Room> => {
    const { data } = await api.post<Room>(`/api/rooms/${roomId}/join`);
    return data;
  },
  joinByCode: async (code: string): Promise<Room> => {
    const { data } = await api.post<Room>(`/api/rooms/join`, { code });
    return data;
  },
  leave: async (roomId: string): Promise<void> => {
    await api.post(`/api/rooms/${roomId}/leave`);
  },
  ready: async (roomId: string, ready: boolean): Promise<void> => {
    await api.post(`/api/rooms/${roomId}/ready`, { ready });
  },
  addBot: async (roomId: string): Promise<Room> => {
    const { data } = await api.post<Room>(`/api/rooms/${roomId}/add-bot`);
    return data;
  },
  kick: async (roomId: string, playerId: string): Promise<void> => {
    await api.post(`/api/rooms/${roomId}/kick`, { playerId });
  },
  start: async (roomId: string): Promise<{ gameId: string }> => {
    const { data } = await api.post<{ gameId: string }>(`/api/rooms/${roomId}/start`);
    return data;
  },
};
