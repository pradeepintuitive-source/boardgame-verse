# Project Memory: WebSocket Protocol & Channels (websocket.md)

GameHub uses STOMP (Simple Text Oriented Messaging Protocol) over SockJS to establish full-duplex real-time state broadcast feeds between client browsers and the Spring Boot backend.

---

## Connection & Handshake Flow

### 1. Handshake Security Bypass

Because standard WebSocket handshake upgrade requests cannot carry custom HTTP headers, the client passes the JWT access token in the query string:

```text
wss://api.pradeepkulal.click/ws?token=eyJhbGciOi...
```

A backend `HandshakeInterceptor` grabs this query parameter, validates it against signature keys, and attaches the authentic user principal context to the WebSocket session descriptor.

### 2. SockJS Transport Selection

If WebSocket transport is blocked by corporate firewall constraints, SockJS falls back to alternative methods in order:

1. `websocket`
2. `xhr-streaming`
3. `xhr-polling`

### 3. Connection Parameters

- **Heartbeats**: Outgoing & incoming ticks set to 10,000ms.
- **Reconnect Delay**: 2,500ms when connection drops.
- **Headers**: JWT is added to STOMP connection frame headers:

```text
CONNECT
Authorization: Bearer eyJhbGciOi...
accept-version: 1.1,1.0
heart-beat: 10000,10000
```

---

## WebSocket Topics (Server-to-Client Broadcasts)

Clients subscribe (`SUBSCRIBE` frame) to broadcast paths to listen for state change notifications.

### 1. Room Membership Updates

- **Topic Destination**: `/topic/rooms/{roomId}`
- **Payload**: Full updated `RoomDto` object.
- **Triggers**: Fires when users join, leave, ready-up, toggle AI, or get kicked. Causes the client to invalidate React Query lobbies.

### 2. In-Game Chat Channel

- **Topic Destination**: `/topic/rooms/{roomId}/chat`
- **Payload**: `ChatMessageResponse` object.
- **Triggers**: Fires when someone posts a chat message. Appends immediately to the UI chat panel without reloading the list.

### 3. Room Seating Presence

- **Topic Destination**: `/topic/rooms/{roomId}/presence`
- **Payload**: Tracks connected lists (e.g. `[ { "userId": "usr-1", "connected": true } ]`).
- **Triggers**: Broadcasts when clients disconnect from or reconnect to the socket gateway.

### 4. Game State Reconciliations

- **Topic Destination**: `/topic/game/{roomId}`
- **Payload**: Monopoly room-broadcast envelopes carrying `type`, `roomId`, `sessionId`, and a `payload` state snapshot or auction update.
- **Triggers**: Reconciles the client-side Monopoly board after REST actions or auction events.

### 5. Private User Queue (Single-User Feed)

- **Topic Destination**: `/user/queue/role` (individual user roles) or `/user/queue/errors` (private rule violations).
- **Payload**: Specific messages sent to a single user context.
- **Triggers**: Used to deliver private roles (e.g. Mafia detective query results) or action failures.

---

## Client-to-Server Actions (`SEND` Frames)

Clients publish data envelopes (`SEND` frame) to destinations mapped to `@MessageMapping` handlers.

### 1. Ready Status Change

- **Destination**: `/app/rooms/{roomId}/ready`
- **Payload**:

```json
{
  "ready": true
}
```

### 2. Lobby Message

- **Destination**: `/app/rooms/{roomId}/chat`
- **Payload**:

```json
{
  "content": "Hey team!",
  "targetUserId": null
}
```

### 3. Submit Monopoly Action

- **Destination**: `/app/games/{sessionId}/action`
- **Payload**:

```json
{
  "type": "ROLL_DICE",
  "tilePosition": null,
  "amount": null,
  "targetPlayerId": null
}
```

- **Usage Note**: The live frontend now prefers `POST /api/monopoly/{sessionId}/action` for normal Monopoly actions because the REST endpoint returns the updated state immediately. This STOMP destination remains part of the backend contract but is no longer the primary client path for Roll/Buy/End Turn style actions.

### 4. Game Auction Bid Action

- **Destination**: `/app/games/{sessionId}/auction`
- **Payload**:

```json
{
  "action": "PLACE_BID",
  "amount": 250
}
```

---

## Reconnection & Resubscription Behavior

- **Status Callback Monitoring**: The `stompClient` exposes status changes to the `useConnectionStore`. The UI displays a `ConnectionIndicator` toast.
- **Resubscription Registry**:
  - The frontend client stores active subscription requests inside a local `Map<string, { stomp: StompSubscription, handler: Handler }>` map.
  - When a dropped connection is restored (`onConnect` callback fires), the client clears the maps, rebuilds new `SUBSCRIBE` commands, and binds the original handlers to the channels, restoring real-time feeds.
