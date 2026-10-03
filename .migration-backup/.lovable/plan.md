## Goal

1. Add a Ready / Not-Ready toggle for every player (including host) in the lobby.
2. Make the lobby auto-refresh in real time when players join/leave or toggle ready — no manual refresh.
3. Provide backend prompt changes required to support this over STOMP/WebSocket.

---

## Frontend Changes

### 1. `src/routes/lobby.$roomId.tsx`
- Wire a proper Ready toggle button for the current user (shown for host too, not just non-host).
  - Label switches between `READY` / `NOT READY` based on `p.ready`.
  - Highlighted state uses accent-cyan when ready.
- On click call `useToggleReady().mutate({ roomId, ready: !currentReady })`.
- Subscribe to the room topic and invalidate the `["room", roomId]` query on any event so the UI refreshes when someone joins/leaves/readies:
  - `useStompSubscription(Topics.room(roomId), () => qc.invalidateQueries({ queryKey: ["room", roomId] }))`
  - Also invalidate `["rooms"]` list for the browse screen.
- Ensure `useConnectionStore().init()` is called (once, in AppShell) so the STOMP socket is live in the lobby.

### 2. `src/hooks/useRooms.ts`
- In `useToggleReady`, on success invalidate `["room", roomId]` (currently it does not) so the local user gets an immediate optimistic refresh even before the WS echo.
- Optional: optimistic update of the `["room", roomId]` cache flipping just the current player's `ready` flag.

### 3. `src/routes/lobby.$roomId.tsx` — polling fallback
- Add `refetchInterval: 3000` on `useRoom` while the WS is not connected (read `useConnectionStore`) so joins still surface if the backend WS is down.

No changes to game engines, stores, or unrelated screens.

---

## Backend Prompt (paste into your Spring Boot backend chat)

> **Realtime lobby updates over STOMP**
>
> Context: Frontend already subscribes to `/topic/rooms/{roomId}` and sends to `/app/rooms/{roomId}/ready`. It expects the backend to broadcast the full updated `Room` DTO whenever the room membership or ready state changes so clients don't need to refetch.
>
> Please implement:
>
> 1. **Ready toggle endpoint**
>    - STOMP: `@MessageMapping("/rooms/{roomId}/ready")` accepting `{ "ready": boolean }` from the authenticated principal.
>    - REST equivalent already exists at `POST /api/rooms/{roomId}/ready` — keep both, share the service method.
>    - Update the `RoomPlayer.connected` (or dedicated `ready`) column for that user in that room.
>
> 2. **Broadcast on every mutation** — after any of these succeed:
>    - `POST /api/rooms` (create)
>    - `POST /api/rooms/{id}/join` and `/rooms/join` (join by code)
>    - `POST /api/rooms/{id}/leave`
>    - `POST /api/rooms/{id}/ready`
>    - `POST /api/rooms/{id}/add-bot`
>    - `POST /api/rooms/{id}/kick`
>    - `POST /api/rooms/{id}/start`
>
>    Publish the updated `RoomDto` (same shape returned by `GET /api/rooms/{id}`) to `/topic/rooms/{roomId}` using `SimpMessagingTemplate.convertAndSend`.
>
> 3. **Presence disconnect** — on WebSocket `SessionDisconnectEvent`, mark that user's `connected=false` in every room they occupy and broadcast the updated room.
>
> 4. **Auth on STOMP** — reuse the JWT already provided as `?token=` query param on the SockJS handshake and via `Authorization` STOMP header (already wired on the client).
>
> Deliverables: `LobbyBroadcaster` component wrapping `SimpMessagingTemplate`, service-layer hooks in `RoomService` after each mutation, and a `WebSocketEventListener` for disconnect handling. No payload schema changes — reuse existing `RoomDto`.

---

## Technical Notes
- STOMP subscription already exists via `useStompSubscription` and `Topics.room`.
- React Query cache invalidation is the simplest sync path — no need to merge deltas manually.
- If backend is not yet updated, the 3s polling fallback keeps behavior acceptable.