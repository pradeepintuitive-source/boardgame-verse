/**
 * Canonical STOMP destinations for the GameHub backend.
 * Server-bound = /app/**, client-subscribed broadcast = /topic/**,
 * private user queue = /user/queue/**.
 */
export const Topics = {
  // Broadcast
  room: (roomId: string) => `/topic/rooms/${roomId}`,
  roomChat: (roomId: string) => `/topic/rooms/${roomId}/chat`,
  // Server broadcasts game lifecycle and updates using roomId as key
  gameRoom: (roomId: string) => `/topic/game/${roomId}`,
  game: (gameId: string) => `/topic/games/${gameId}`,
  gameEvents: (gameId: string) => `/topic/games/${gameId}/events`,
  presence: (roomId: string) => `/topic/rooms/${roomId}/presence`,

  // Private (per-user)
  privateRole: "/user/queue/role",
  privateError: "/user/queue/errors",
  privateAcks: "/user/queue/acks",

  // Send (client → server)
  send: {
    roomReady: (roomId: string) => `/app/rooms/${roomId}/ready`,
    roomChat: (roomId: string) => `/app/rooms/${roomId}/chat`,
    gameAction: (sessionId: string) => `/app/games/${sessionId}/action`,
    auction: (sessionId: string) => `/app/games/${sessionId}/auction`,
    pause: (gameId: string) => `/app/games/${gameId}/pause`,
    resume: (gameId: string) => `/app/games/${gameId}/resume`,
  },
} as const;
