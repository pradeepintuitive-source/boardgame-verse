import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameType, Player, Room } from "../models";
import { pickAvatarColor, roomCode, uid } from "../utils/ids";

interface LobbyState {
  rooms: Record<string, Room>;
  createRoom: (input: {
    name: string;
    gameType: GameType;
    maxPlayers: number;
    aiPlayerCount: number;
    isPrivate: boolean;
    isLan: boolean;
    hostId: string;
    hostName: string;
    hostColor: string;
  }) => Room;
  joinRoom: (roomId: string, player: Omit<Player, "isHost" | "isAI" | "ready">) => Room | null;
  joinByCode: (code: string, player: Omit<Player, "isHost" | "isAI" | "ready">) => Room | null;
  addAI: (roomId: string) => void;
  removePlayer: (roomId: string, playerId: string) => void;
  toggleReady: (roomId: string, playerId: string) => void;
  getRoom: (roomId: string) => Room | undefined;
}

const aiNames = ["NEO-7", "VEX-2", "CIPHER", "ORACLE", "WRAITH", "PHANTOM", "RAVEN", "ECHO"];

export const useLobbyStore = create<LobbyState>()(
  persist(
    (set, get) => ({
  rooms: {},
  createRoom: (i) => {
    const id = uid("room");
    const host: Player = {
      id: i.hostId,
      username: i.hostName,
      avatarColor: i.hostColor,
      isHost: true,
      isAI: false,
      ready: true,
    };
    const room: Room = {
      id,
      code: roomCode(),
      name: i.name,
      gameType: i.gameType,
      maxPlayers: i.maxPlayers,
      aiPlayerCount: i.aiPlayerCount,
      isPrivate: i.isPrivate,
      isLan: i.isLan,
      hostId: i.hostId,
      players: [host],
      createdAt: Date.now(),
    };
    // Seed AI players
    for (let k = 0; k < i.aiPlayerCount && room.players.length < i.maxPlayers; k++) {
      const name = aiNames[k % aiNames.length];
      room.players.push({
        id: uid("ai"),
        username: name,
        avatarColor: pickAvatarColor(name),
        isHost: false,
        isAI: true,
        ready: true,
      });
    }
    set((s) => ({ rooms: { ...s.rooms, [id]: room } }));
    return room;
  },
  joinRoom: (roomId, p) => {
    const room = get().rooms[roomId];
    if (!room) return null;
    if (room.players.some((x) => x.id === p.id)) return room;
    if (room.players.length >= room.maxPlayers) return null;
    const player: Player = { ...p, isHost: false, isAI: false, ready: false };
    const updated = { ...room, players: [...room.players, player] };
    set((s) => ({ rooms: { ...s.rooms, [roomId]: updated } }));
    return updated;
  },
  joinByCode: (code, p) => {
    const room = Object.values(get().rooms).find(
      (r) => r.code.toUpperCase() === code.toUpperCase(),
    );
    if (!room) return null;
    return get().joinRoom(room.id, p);
  },
  addAI: (roomId) => {
    const room = get().rooms[roomId];
    if (!room || room.players.length >= room.maxPlayers) return;
    const name = aiNames[room.players.filter((p) => p.isAI).length % aiNames.length];
    const ai: Player = {
      id: uid("ai"),
      username: name,
      avatarColor: pickAvatarColor(name),
      isHost: false,
      isAI: true,
      ready: true,
    };
    set((s) => ({
      rooms: { ...s.rooms, [roomId]: { ...room, players: [...room.players, ai] } },
    }));
  },
  removePlayer: (roomId, playerId) => {
    const room = get().rooms[roomId];
    if (!room) return;
    set((s) => ({
      rooms: {
        ...s.rooms,
        [roomId]: { ...room, players: room.players.filter((p) => p.id !== playerId) },
      },
    }));
  },
  toggleReady: (roomId, playerId) => {
    const room = get().rooms[roomId];
    if (!room) return;
    set((s) => ({
      rooms: {
        ...s.rooms,
        [roomId]: {
          ...room,
          players: room.players.map((p) =>
            p.id === playerId ? { ...p, ready: !p.ready } : p,
          ),
        },
      },
    }));
  },
  getRoom: (roomId) => get().rooms[roomId],
    }),
    { name: "gh-lobby" },
  ),
);