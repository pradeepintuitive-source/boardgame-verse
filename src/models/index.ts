export type GameType = "mafia" | "monopoly";

export interface User {
  id: string;
  username: string;
  email?: string;
  avatarColor: string;
  isGuest: boolean;
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  avatarColor: string;
  isHost: boolean;
  isAI: boolean;
  ready: boolean;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  gameType: GameType;
  maxPlayers: number;
  aiPlayerCount: number;
  isPrivate: boolean;
  isLan: boolean;
  hostId: string;
  players: Player[];
  createdAt: number;
}

export type MafiaRole = "villager" | "mafia" | "detective" | "doctor";
export type MafiaPhase = "lobby" | "night" | "day" | "voting" | "ended";

export interface MafiaPlayer extends Player {
  role: MafiaRole;
  alive: boolean;
  votedFor?: string | null;
}

export interface MafiaState {
  gameId: string;
  phase: MafiaPhase;
  round: number;
  players: MafiaPlayer[];
  log: ModeratorMessage[];
  winner?: "mafia" | "villagers" | null;
  /* night action selections by current player */
  nightActions: Record<string, string | null>; // actorId -> targetId
}

export interface ModeratorMessage {
  id: string;
  text: string;
  kind: "narration" | "announcement" | "rule" | "system";
  ts: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatarColor: string;
  text: string;
  ts: number;
  channel: "public" | "private" | "ai";
}

export interface ConnectionState {
  connected: boolean;
  reconnecting: boolean;
  lastError: string | null;
  latencyMs: number | null;
}
