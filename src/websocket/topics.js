"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topics = void 0;
/**
 * Canonical STOMP destinations for the GameHub backend.
 * Server-bound = /app/**, client-subscribed broadcast = /topic/**,
 * private user queue = /user/queue/**.
 */
exports.Topics = {
    // Broadcast
    room: function (roomId) { return "/topic/rooms/".concat(roomId); },
    roomChat: function (roomId) { return "/topic/rooms/".concat(roomId, "/chat"); },
    // Server broadcasts game lifecycle and updates using roomId as key
    gameRoom: function (roomId) { return "/topic/game/".concat(roomId); },
    game: function (gameId) { return "/topic/games/".concat(gameId); },
    gameEvents: function (gameId) { return "/topic/games/".concat(gameId, "/events"); },
    presence: function (roomId) { return "/topic/rooms/".concat(roomId, "/presence"); },
    // Private (per-user)
    privateRole: "/user/queue/role",
    privateError: "/user/queue/errors",
    // Send (client → server)
    send: {
        roomReady: function (roomId) { return "/app/rooms/".concat(roomId, "/ready"); },
        roomChat: function (roomId) { return "/app/rooms/".concat(roomId, "/chat"); },
        gameAction: function (gameId) { return "/app/games/".concat(gameId, "/action"); },
        auction: function (gameId) { return "/app/games/".concat(gameId, "/auction"); },
        pause: function (gameId) { return "/app/games/".concat(gameId, "/pause"); },
        resume: function (gameId) { return "/app/games/".concat(gameId, "/resume"); },
    },
};
