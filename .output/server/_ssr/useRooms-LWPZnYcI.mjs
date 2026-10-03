import { u as useQueryClient, a as useMutation, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as api, A as API_BASE_URL, p as pickAvatarColor } from "./router-CrXfqMs4.mjs";
function normalizeRoom(raw) {
  const players = raw.players.map((player) => ({
    id: player.id,
    userId: player.userId,
    username: player.displayName,
    avatarColor: pickAvatarColor(player.displayName),
    isHost: player.userId === raw.hostUserId,
    isAI: player.aiControlled,
    ready: player.ready,
    connected: player.connected
  }));
  return {
    id: raw.id,
    code: raw.roomCode,
    name: `Room ${raw.roomCode}`,
    gameType: raw.gameType.toLowerCase(),
    maxPlayers: raw.maxPlayers,
    aiPlayerCount: players.filter((p) => p.isAI).length,
    isPrivate: raw.visibility === "PRIVATE",
    isLan: raw.roomType === "LAN",
    hostId: raw.hostUserId,
    state: raw.state ?? "WAITING",
    currentSessionId: raw.currentSessionId ?? null,
    players,
    createdAt: Date.now()
  };
}
const roomsApi = {
  list: async (gameType) => {
    const { data } = await api.get("rooms", {
      params: gameType ? { gameType: gameType.toUpperCase() } : void 0
    });
    return data.map(normalizeRoom);
  },
  get: async (roomId) => {
    const { data } = await api.get(`rooms/${roomId}`);
    return normalizeRoom(data);
  },
  create: async (req) => {
    console.log("roomsApi.create called");
    console.log("API Base URL:", API_BASE_URL);
    console.log("Request:", req);
    const { data } = await api.post("rooms", {
      gameType: req.gameType.toUpperCase(),
      roomType: req.isLan ? "LAN" : "ONLINE",
      visibility: req.isPrivate ? "PRIVATE" : "PUBLIC",
      maxPlayers: req.maxPlayers
    });
    console.log(api.defaults.baseURL + "/api/rooms");
    return normalizeRoom(data);
  },
  join: async (roomId) => {
    const { data } = await api.post(`rooms/${roomId}/join`);
    return normalizeRoom(data);
  },
  reconnect: async (roomId) => {
    const { data } = await api.post(`rooms/${roomId}/reconnect`);
    return normalizeRoom(data);
  },
  joinByCode: async (code) => {
    const { data } = await api.post(`rooms/join`, { roomCode: code });
    return normalizeRoom(data);
  },
  leave: async (roomId) => {
    await api.post(`rooms/${roomId}/leave`);
  },
  addBot: async (roomId) => {
    const { data } = await api.post(`rooms/${roomId}/add-bot`);
    return normalizeRoom(data);
  },
  kick: async (roomId, playerId) => {
    await api.post(`rooms/${roomId}/kick`, { playerId });
  },
  start: async (roomId) => {
    const { data } = await api.post(`games/start`, {
      roomId
    });
    return data;
  }
};
function useRoom(roomId) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomsApi.get(roomId),
    enabled: !!roomId
  });
}
function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req) => roomsApi.create(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] })
  });
}
function useJoinRoomByCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code) => roomsApi.joinByCode(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] })
  });
}
function useStartGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId) => roomsApi.start(roomId),
    onSuccess: (_data, roomId) => {
      qc.invalidateQueries({ queryKey: ["room", roomId] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
    }
  });
}
function useLeaveRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId) => roomsApi.leave(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] })
  });
}
function useReconnectRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId) => roomsApi.reconnect(roomId),
    onSuccess: (room) => {
      qc.setQueryData(["room", room.id], room);
      qc.invalidateQueries({ queryKey: ["rooms"] });
    }
  });
}
export {
  useCreateRoom as a,
  useRoom as b,
  useLeaveRoom as c,
  useReconnectRoom as d,
  useStartGame as e,
  useJoinRoomByCode as u
};
