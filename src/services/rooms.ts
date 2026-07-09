import { api, API_BASE_URL } from "./api";
import { pickAvatarColor } from "../utils/ids";
import type { GameType, Player, Room } from "../models";

interface RawPlayerSummary {
  id: string;
  userId: string;
  displayName: string;
  connected: boolean;
  ready: boolean;
  aiControlled: boolean;
  aiType?: string;
  aiDifficulty?: string;
  seatOrder: number;
}

interface RawRoom {
  id: string;
  roomCode: string;
  hostUserId: string;
  gameType: string;
  roomType: string;
  visibility: string;
  state: string;
  maxPlayers: number;
  players: RawPlayerSummary[];
  currentSessionId?: string | null;
}

export interface CreateRoomRequest {
  name: string;
  gameType: GameType;
  maxPlayers: number;
  aiPlayerCount?: number;
  isPrivate?: boolean;
  isLan?: boolean;
}

function normalizeRoom(raw: RawRoom): Room {
  const players: Player[] = raw.players.map((player) => ({
    id: player.id,
    userId: player.userId,
    username: player.displayName,
    avatarColor: pickAvatarColor(player.displayName),
    isHost: player.userId === raw.hostUserId,
    isAI: player.aiControlled,
    ready: player.ready,
  }));

  return {
    id: raw.id,
    code: raw.roomCode,
    name: `Room ${raw.roomCode}`,
    gameType: raw.gameType.toLowerCase() as GameType,
    maxPlayers: raw.maxPlayers,
    aiPlayerCount: players.filter((p) => p.isAI).length,
    isPrivate: raw.visibility === "PRIVATE",
    isLan: raw.roomType === "LAN",
    hostId: raw.hostUserId,
    players,
    createdAt: Date.now(),
  };
}

export const roomsApi = {
  list: async (gameType?: GameType): Promise<Room[]> => {
    
    const { data } = await api.get<RawRoom[]>("rooms", {
      params: gameType ? { gameType: gameType.toUpperCase() } : undefined,
    });
    return data.map(normalizeRoom);
  },
  get: async (roomId: string): Promise<Room> => {
    const { data } = await api.get<RawRoom>(`rooms/${roomId}`);
    return normalizeRoom(data);
  },
  create: async (req: CreateRoomRequest): Promise<Room> => {
      console.log("roomsApi.create called");
  console.log("API Base URL:", API_BASE_URL);
  console.log("Request:", req);
    const { data } = await api.post<RawRoom>("rooms", {
      gameType: req.gameType.toUpperCase(),
      roomType: req.isLan ? "LAN" : "ONLINE",
      visibility: req.isPrivate ? "PRIVATE" : "PUBLIC",
      maxPlayers: req.maxPlayers,
    });
    console.log(api.defaults.baseURL + "/api/rooms");
    return normalizeRoom(data);
  },
  join: async (roomId: string): Promise<Room> => {
    const { data } = await api.post<RawRoom>(`rooms/${roomId}/join`);
    return normalizeRoom(data);
  },
  joinByCode: async (code: string): Promise<Room> => {
    const { data } = await api.post<RawRoom>(`rooms/join`, { roomCode: code });
    return normalizeRoom(data);
  },
  leave: async (roomId: string): Promise<void> => {
    await api.post(`rooms/${roomId}/leave`);
  },
  ready: async (roomId: string, ready: boolean): Promise<void> => {
    await api.post(`rooms/${roomId}/ready`, { ready });
  },
  addBot: async (roomId: string): Promise<Room> => {
    const { data } = await api.post<RawRoom>(`rooms/${roomId}/add-bot`);
    return normalizeRoom(data);
  },
  kick: async (roomId: string, playerId: string): Promise<void> => {
    await api.post(`rooms/${roomId}/kick`, { playerId });
  },
  start: async (roomId: string): Promise<{ gameId: string }> => {
    const { data } = await api.post<{ gameId: string }>(`rooms/${roomId}/start`);
    return data;
  },
};
