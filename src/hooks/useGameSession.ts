import { useMutation, useQuery } from "@tanstack/react-query";
import { gamesApi } from "../services/games";

export function useGameSnapshot<T = unknown>(gameId: string | undefined) {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: () => gamesApi.snapshot<T>(gameId!),
    enabled: !!gameId,
  });
}

export function usePauseGame() {
  return useMutation({ mutationFn: (gameId: string) => gamesApi.pause(gameId) });
}
export function useResumeGame() {
  return useMutation({ mutationFn: (gameId: string) => gamesApi.resume(gameId) });
}
export function useEndGame() {
  return useMutation({ mutationFn: (gameId: string) => gamesApi.end(gameId) });
}