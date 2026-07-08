import { api } from "./api";

export const gamesApi = {
  snapshot: async <T = unknown>(gameId: string): Promise<T> => {
    const { data } = await api.get<T>(`games/${gameId}`);
    return data;
  },
  log: async <T = unknown>(gameId: string): Promise<T[]> => {
    const { data } = await api.get<T[]>(`games/${gameId}/log`);
    return data;
  },
  pause: async (gameId: string): Promise<void> => {
    await api.post(`games/${gameId}/pause`);
  },
  resume: async (gameId: string): Promise<void> => {
    await api.post(`games/${gameId}/resume`);
  },
  end: async (gameId: string): Promise<void> => {
    await api.post(`games/${gameId}/end`);
  },
};
