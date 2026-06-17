import { api } from "./api";

export const gamesApi = {
  snapshot: async <T = unknown>(gameId: string): Promise<T> => {
    const { data } = await api.get<T>(`/api/games/${gameId}`);
    return data;
  },
  log: async <T = unknown>(gameId: string): Promise<T[]> => {
    const { data } = await api.get<T[]>(`/api/games/${gameId}/log`);
    return data;
  },
  pause: async (gameId: string): Promise<void> => {
    await api.post(`/api/games/${gameId}/pause`);
  },
  resume: async (gameId: string): Promise<void> => {
    await api.post(`/api/games/${gameId}/resume`);
  },
  end: async (gameId: string): Promise<void> => {
    await api.post(`/api/games/${gameId}/end`);
  },
};