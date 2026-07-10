import { api } from "./api";

export const monopolyApi = {
  action: async (sessionId: string, body: unknown): Promise<void> => {
    await api.post(`monopoly/${sessionId}/action`, body);
  },
  getState: async <T = unknown>(sessionId: string): Promise<T> => {
    const { data } = await api.get<T>(`monopoly/${sessionId}`);
    return data;
  },
};
