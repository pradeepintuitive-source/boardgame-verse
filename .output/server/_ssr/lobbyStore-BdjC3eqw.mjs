import { c as create, p as persist } from "../_libs/zustand.mjs";
import { p as pickAvatarColor, i as uid } from "./router-CrXfqMs4.mjs";
const aiNames = ["NEO-7", "VEX-2", "CIPHER", "ORACLE", "WRAITH", "PHANTOM", "RAVEN", "ECHO"];
const useLobbyStore = create()(
  persist(
    (set, get) => ({
      rooms: {},
      joinRoom: (roomId, p) => {
        const room = get().rooms[roomId];
        if (!room) return null;
        if (room.players.some((x) => x.id === p.id)) return room;
        if (room.players.length >= room.maxPlayers) return null;
        const player = { ...p, isHost: false, isAI: false, ready: false };
        const updated = { ...room, players: [...room.players, player] };
        set((s) => ({ rooms: { ...s.rooms, [roomId]: updated } }));
        return updated;
      },
      joinByCode: (code, p) => {
        const room = Object.values(get().rooms).find(
          (r) => r.code.toUpperCase() === code.toUpperCase()
        );
        if (!room) return null;
        return get().joinRoom(room.id, p);
      },
      addAI: (roomId) => {
        const room = get().rooms[roomId];
        if (!room || room.players.length >= room.maxPlayers) return;
        const name = aiNames[room.players.filter((p) => p.isAI).length % aiNames.length];
        const ai = {
          id: uid("ai"),
          userId: uid("ai-user"),
          username: name,
          avatarColor: pickAvatarColor(name),
          isHost: false,
          isAI: true,
          ready: true,
          connected: true
        };
        set((s) => ({
          rooms: { ...s.rooms, [roomId]: { ...room, players: [...room.players, ai] } }
        }));
      },
      removePlayer: (roomId, playerId) => {
        const room = get().rooms[roomId];
        if (!room) return;
        set((s) => ({
          rooms: {
            ...s.rooms,
            [roomId]: { ...room, players: room.players.filter((p) => p.id !== playerId) }
          }
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
              players: room.players.map((p) => p.id === playerId ? { ...p, ready: !p.ready } : p)
            }
          }
        }));
      },
      getRoom: (roomId) => get().rooms[roomId],
      upsertRoom: (room) => set((s) => ({ rooms: { ...s.rooms, [room.id]: room } }))
    }),
    { name: "gh-lobby" }
  )
);
export {
  useLobbyStore as u
};
