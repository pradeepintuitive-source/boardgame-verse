import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomsApi, type CreateRoomRequest } from "../services/rooms";
import type { GameType } from "../models";

const KEY = (gameType?: GameType) => ["rooms", gameType ?? "all"] as const;

export function useRooms(gameType?: GameType) {
  return useQuery({
    queryKey: KEY(gameType),
    queryFn: () => roomsApi.list(gameType),
    staleTime: 5_000,
  });
}

export function useRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomsApi.get(roomId!),
    enabled: !!roomId,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateRoomRequest) => roomsApi.create(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useJoinRoomByCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => roomsApi.joinByCode(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useStartGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsApi.start(roomId),
    onSuccess: (_data, roomId) => {
      qc.invalidateQueries({ queryKey: ["room", roomId] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useLeaveRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsApi.leave(roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useReconnectRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsApi.reconnect(roomId),
    onSuccess: (room) => {
      qc.setQueryData(["room", room.id], room);
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useAddBot() {
  return useMutation({ mutationFn: (roomId: string) => roomsApi.addBot(roomId) });
}
