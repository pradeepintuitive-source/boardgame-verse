# Project Memory: Architecture (architecture.md)

## System Overview

GameHub operates as a hybrid architecture with a strict separation between client-side user interface (built as a React SPA) and the game state authority (external Spring Boot server).

```mermaid
graph TD
    User([User's Browser]) -->|HTTPS / REST| SPA[Vite React Client]
    User -->|WSS / STOMP| SPA
    SPA -->|Axios API Calls| Backend[Spring Boot Backend API]
    SPA -->|SockJS / STOMP| WebSocketServer[Spring Boot WebSocket Broker]
    WebSocketServer -->|Subscribed Updates| SPA
    Backend -->|Read / Write| Database[(PostgreSQL/MySQL Database)]
```

## Hybrid Operational Modes

### 1. Authoritative Online Mode (Connected)

When the client successfully connects to the external Spring Boot backend through the configured direct URL (`NEXT_PUBLIC_API_URL` / `VITE_API_URL` for REST and `NEXT_PUBLIC_WS_URL` / `VITE_STOMP_URL` for sockets):

- **State Authority**: The backend processes all state updates, validates moves (e.g. dice rolls, property purchases, trades), and maintains game database state.
- **Synchronization**: The frontend subscribes to `/topic/game/{roomId}` for authoritative Monopoly broadcasts. Normal Monopoly actions go through `POST /api/monopoly/{sessionId}/action` and apply the returned state immediately; auction controls are the only Monopoly actions still published over STOMP at `/app/games/{sessionId}/auction`.

### 2. Local Fallback Offline Mode (Single-Device / Demo)

If `VITE_STOMP_URL` is omitted, or if the STOMP connection client reports offline status (`stomp.isOffline` is true):

- **State Authority**: The browser client behaves as the state authority.
- **Simulation Loop**: Interactive moves (rolling dice, resolving board land events, resolving night actions) are evaluated locally in the browser using pure client-side simulation state engines (`mafiaEngine.ts` and `monopolyEngine.ts`). Zustand stores update synchronously in response to these local events, enabling single-device pass-and-play and AI bot matches.

---

## Data and Message Flow

### 1. Online Monopoly Action Flow (REST Authority + STOMP Broadcast)

```mermaid
sequenceDiagram
    autonumber
    actor Player as Human Player
    participant UI as Monopoly React Page
    participant Store as monopolyStore (Zustand)
    participant REST as Axios Client
    participant Server as Spring Boot App
    participant Socket as STOMP Client (stompClient.ts)

    Player->>UI: Clicks "Roll Dice"
    UI->>REST: POST /api/monopoly/{sessionId}/action { type: "ROLL_DICE" }
    REST->>Server: Submit action
    Server-->>REST: Return updated Monopoly state
    REST->>Store: applyMonopolyState(updatedState)
    Store-->>UI: Re-render immediately from REST response
    Server-->>Socket: Broadcast updated payload to "/topic/game/{roomId}"
    Socket->>Store: handleGameUpdate(msg)
    Store->>Store: mapSnapshotToState(msg) reconciles client cache with server authority
    Store-->>UI: Re-render UI with definitive server state
```

### 2. Mafia Local Simulation Flow (Client-Side Authority)

```mermaid
sequenceDiagram
    autonumber
    actor Host as Moderator / Human Player
    participant UI as Mafia React Page
    participant Store as gameStore (Zustand)
    participant Engine as mafiaEngine.ts (Pure Functions)

    Host->>UI: Clicks "Confirm Night Actions"
    UI->>Engine: resolveNight(state, actions)
    Note over Engine: Selects random targets for silent AI players
    Note over Engine: Applies Mafia target vs Doctor protect checks
    Note over Engine: Evaluates victory conditions
    Engine-->>UI: Returns updated MafiaState payload
    UI->>Store: setMafia(gameId, nextState)
    Store-->>UI: Re-renders board atmosphere (from Night radial to Daybreak)
```

---

## Module and Directory Interactions

- **Routing Layer (`src/routes/*`)**: Acts as the controller. Captures parameters (like `roomId` and `gameId`), initializes query feeds (`useRoom`, `useGameSnapshot`), subscribes to WebSocket updates via `useStompSubscription`, and binds UI actions to endpoints.
- **Component Layer (`src/components/*`)**: Represents pure visual shells. Subcomponents like `Board.tsx` or `PlayerSeat.tsx` read layout data structures (e.g. `monopolyBoard.ts`) and player status models to render neon layouts.
- **State Layer (`src/store/*`)**: Stores client-side records. Zustand stores are persistent (`gh-lobby`, `gh-monopoly`, `gamehub.auth`) to prevent state loss during page refreshes.
- **Service Client Layer (`src/services/*`)**: Houses REST definitions. Reusable api clients wrap endpoint addresses and handle JWT token additions.
- **WebSocket Service Layer (`src/websocket/*`)**: Registers topic nodes and manages handshake processes. Connects and handles silent reconnections.
