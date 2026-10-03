import type { MonopolyActionRequest } from "../models/monopoly";
import { api } from "./api";

export const monopolyApi = {
  action: async <T>(sessionId: string, body: MonopolyActionRequest): Promise<T> => {
    const { data } = await api.post<T>(`monopoly/${sessionId}/action`, body);
    return data;
  },
  getState: async <T = unknown>(sessionId: string): Promise<T> => {
    const { data } = await api.get<T>(`monopoly/${sessionId}`);
    return data;
  },
};
