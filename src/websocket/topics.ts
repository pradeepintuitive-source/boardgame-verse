/**
 * Canonical STOMP destinations for the GameHub backend.
 * Server-bound = /app/**, client-subscribed broadcast = /topic/**,
 * private user queue = /user/queue/**.
 */
export const Topics = {
  // Broadcast
  room: (roomId: string) => `/topic/rooms/${roomId}`,
  roomChat: (roomId: string) => `/topic/rooms/${roomId}/chat`,
  game: (gameId: string) => `/topic/games/${gameId}`,
  gameEvents: (gameId: string) => `/topic/games/${gameId}/events`,
  presence: (roomId: string) => `/topic/rooms/${roomId}/presence`,

  // Private (per-user)
  privateRole: "/user/queue/role",
  privateError: "/user/queue/errors",

  // Send (client → server)
  send: {
    roomReady: (roomId: string) => `/app/rooms/${roomId}/ready`,
    roomChat: (roomId: string) => `/app/rooms/${roomId}/chat`,
    gameAction: (gameId: string) => `/app/games/${gameId}/action`,
    pause: (gameId: string) => `/app/games/${gameId}/pause`,
    resume: (gameId: string) => `/app/games/${gameId}/resume`,
  },
} as const;