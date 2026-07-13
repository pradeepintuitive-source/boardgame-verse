import { create } from "zustand";
import { toast } from "sonner";

export type RequestStatus = "pending" | "acknowledged" | "completed" | "failed";

export interface PendingRequest {
  requestId: string;
  action: string;
  status: RequestStatus;
  createdAt: number;
  timeoutId?: ReturnType<typeof setTimeout> | null;
  metadata?: Record<string, unknown>;
}

interface RequestStore {
  pendingRequests: PendingRequest[];
  createRequest: (
    action: string,
    requestId?: string,
    metadata?: Record<string, unknown>,
    timeoutMs?: number,
  ) => PendingRequest | null;
  markAcknowledged: (requestId: string) => void;
  completeRequest: (requestId: string) => void;
  completeAllRequests: () => void;
  failRequest: (requestId: string, errorCode?: string, message?: string) => void;
  clearAll: () => void;
}

const DEFAULT_TIMEOUT_MS = 15000;

const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useWebsocketRequestStore = create<RequestStore>((set, get) => ({
  pendingRequests: [],

  createRequest: (action, requestId = makeId(), metadata, timeoutMs = DEFAULT_TIMEOUT_MS) => {
    console.log("CREATE REQUEST", { action, requestId });
    if (!action) return null;
    const existing = get().pendingRequests.find((req) => req.requestId === requestId);
    if (existing) return existing;

    const entry: PendingRequest = {
      requestId,
      action,
      status: "pending",
      createdAt: Date.now(),
      metadata: metadata ?? {},
    };

    const timeoutHandle = setTimeout(() => {
      get().failRequest(requestId, "TIMEOUT", "Unable to contact server");
    }, timeoutMs);
    entry.timeoutId = timeoutHandle;

    set((state) => ({ pendingRequests: [...state.pendingRequests, entry] }));
    return entry;
  },

  markAcknowledged: (requestId) => {
    console.log("ACK MARKED", requestId);
    set((state) => ({
      pendingRequests: state.pendingRequests.map((req) =>
        req.requestId === requestId ? { ...req, status: "acknowledged" } : req,
      ),
    }));
  },

  completeRequest: (requestId) => {
    console.log("COMPLETE REQUEST", requestId);
    const request = get().pendingRequests.find((req) => req.requestId === requestId);
    if (request?.timeoutId) {
      clearTimeout(request.timeoutId);
    }
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((req) => req.requestId !== requestId),
    }));
  },

  completeAllRequests: () => {
    get().pendingRequests.forEach((req) => {
      if (req.timeoutId) clearTimeout(req.timeoutId);
    });
    set({ pendingRequests: [] });
  },

  failRequest: (requestId, errorCode, message) => {
    console.log("FAIL REQUEST", { requestId, errorCode, message });
    const request = get().pendingRequests.find((req) => req.requestId === requestId);
    if (request?.timeoutId) {
      clearTimeout(request.timeoutId);
    }
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((req) => req.requestId !== requestId),
    }));
    toast.error(message ?? "Request failed", {
      description: errorCode ? `${errorCode}` : undefined,
    });
  },

  clearAll: () => {
    get().pendingRequests.forEach((req) => {
      if (req.timeoutId) clearTimeout(req.timeoutId);
    });
    set({ pendingRequests: [] });
  },
}));
