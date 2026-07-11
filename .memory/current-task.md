# Current Task: Enable Monopoly Selection and Fix WebSocket Action Features

## Objective
Enable Monopoly room creation, configure default player options, resolve connection failures, and ensure game actions transmit successfully over WebSocket to resolve synchronization issues.

## Subtasks
* [x] Enable Monopoly selection in the room creation UI.
* [x] Remove the "SOON" label from the Monopoly game selection button.
* [x] Set default Max Players to 3 and default AI Players to 0 in the create room page.
* [x] Resolve relative STOMP broker URLs dynamically to absolute URLs in `stompClient.ts` to support SockJS on same-origin proxy.
* [x] Set `VITE_STOMP_URL` to `/ws` in `.env` to route through the Vercel rewrite proxy to bypass CORS.
* [x] Change the STOMP subscription destination in `monopoly.$gameId.tsx` to `Topics.game(gameId)` to listen on the correct authoritative state broadcast channel `/topic/games/{gameId}`.
* [x] Update project memory files: `current-task.md`, `session.md`, `changelog.md`, `decisions.md`, and `known-issues.md`.

## Active Context
* WebSocket connections are routed through Vercel's proxy rewrite `/ws` to bypass CORS.
* Authorship and synchronization are managed on the `/topic/games/{gameId}` channel.
