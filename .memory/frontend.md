# Project Memory: Frontend Architecture (frontend.md)

## Core UI Architecture
The user interface is styled as a retro-futuristic arcade portal using **glassmorphism** design elements:
* **Visuals**: Dark background colors (`#050507`), vibrant primary neon colors (neon cyan `#00f2ff`, neon pink `#ff00e5`, neon amber `#facc15`), and blurred transparent panels (`glass-panel` backing custom filters).
* **Animations**: Consistent frame transitions configured in `variants.ts` and managed via Framer Motion's `<AnimatePresence>` and custom Tailwind utility mappings.
* **Fonts**: Custom retro headlines use Google's "Anton" font, monospace panels use "JetBrains Mono", and body text uses "Inter".

---

## Routing Structure (TanStack Router)
Routes are defined inside `src/routes/` as file-based routing endpoints.
* **Root Configuration (`__root.tsx`)**: Configures the base HTML shell. Sets up the React Query `<QueryClientProvider>` context and mounts the `<AuthProvider>`, the global toast engine (`Toaster`), and the error handlers.
* **Main Dashboard (`index.tsx`)**: Renders game selections (cards for Mafia and Monopoly) and links to create/join pages.
* **Authentication Pages (`login.tsx` / `register.tsx`)**: Renders sign-in and sign-up interfaces. Enables registered logins or quick guest creation.
* **Lobby Waiting Area (`lobby.$roomId.tsx`)**: Tracks player joins, bot additions, readiness indicators, and triggers session-start API commands. Sets up WebSocket topic triggers for list invalidation.
* **Mafia Board Room (`mafia.$gameId.tsx`)**: Renders atmospheric radial glows matching phases (night/day/voting). Feeds state updates into client-side game loops.
* **Monopoly Board Room (`monopoly.$gameId.tsx`)**: Assembles the complete 40-tile rectangular layout (`Board.tsx`), cash balances, trade drawers, mortgage toggles, house upgrades, and auction grids.

---

## Component Registry

### 1. Common Reusable Elements (`src/components/common/`)
* **NeonButton.tsx**: Styled buttons with custom box shadow variants (cyan/pink neon glowing glows).
* **Avatar.tsx**: Renders initials against procedurally picked colors to represent players.
* **ConnectionIndicator.tsx**: Renders STOMP socket state: `LIVE` (green), `RECONNECTING` (yellow), and `OFFLINE` / `LOCAL` (red).
* **ParticleField.tsx**: Floating canvas particles drawing background depth.

### 2. Monopoly Component Modules (`src/components/monopoly/`)
* **Board.tsx**: Handles rectangular Board coordinates. Plots tokens on 40 tile locations.
* **Tile.tsx**: Renders individual properties, railroads, cards, taxes, and jail positions, showing owners and built houses.
* **ActionBar.tsx**: Context-dependent player action buttons (Roll, Buy, End Turn, Build House, Manage Bank).
* **TradePanel.tsx**: Split drawer panel allowing players to swap cash, cards, and properties.
* **AuctionPanel.tsx**: Timed bid submission overlays with increment buttons.
* **BankManager.tsx**: Cheat/debug overlay allowing manual adjustments (adding/transferring cash).

---

## State Stores (Zustand)
Zustand is used for client-side persistence and local offline caching:
1. **authStore (`useAuthStore`)**: Stores active user models. Persisted in localStorage (`gamehub.auth`).
2. **connectionStore (`useConnectionStore`)**: Tracks WebSocket connection state, reconnect timers, latency metrics, and current channel configurations.
3. **lobbyStore (`useLobbyStore`)**: Cache for offline room memberships and bot details. Persisted in localStorage (`gh-lobby`).
4. **gameStore (`useGameStore`)**: Key-value cache tracking state updates for client-side Mafia rooms (`gameId -> MafiaState`).
5. **monopolyStore (`useMonopolyStore`)**: Key-value cache tracking state updates for Monopoly matches (`gameId -> MonopolyState`). Persisted in localStorage (`gh-monopoly`).

---

## Custom Composables / Hooks (`src/hooks/`)
* **useRooms.ts**: Encapsulates REST services using React Query mutations:
  * `useRooms` (room queries)
  * `useCreateRoom` (room creations)
  * `useJoinRoomByCode` (join commands)
  * `useToggleReady` (readiness toggle updates)
  * `useStartGame` (monopoly start calls)
* **useGameSession.ts**: Wrapper hooks for Monopoly matches:
  * `useGameSnapshot` (snapshot fetches)
  * `usePauseGame` / `useResumeGame` / `useEndGame` (lifecycle commands)
* **useStompSubscription.ts**: Manages React `useEffect` lifecycles for WebSocket subscriptions. Subscribes on mount and unsubscribes on unmount.
* **useStompStatusToasts.ts**: Fires toast messages when connections drop, reconnect, or fail.

---

## API & WebSocket Communication Protocol

### REST Communication Layer (`src/services/api.ts`)
* Pre-configured Axios instance. Sets global base URL via `import.meta.env.VITE_API_URL` (defaults to `/api`).
* Interceptors:
  * **Request Interceptor**: Adds JWT token dynamically: `Authorization: Bearer <token>`.
  * **Response Interceptor**: Unwraps backend API envelopes (converts Success bodies into `ApiResponse<T>.data`). Surfaces validation errors or server failures via global toast alerts.

### STOMP WebSocket Protocol (`src/websocket/stompClient.ts`)
* Implemented as a singleton `stomp`.
* Resolves the server socket address using `VITE_STOMP_URL`.
* Uses SockJS to build transport channels. If HTTP/HTTPS URLs are passed, it appends the JWT bearer token as a query parameter (`token=`) so backend WebSocket handshake filters can authorize the initial HTTP upgrade request.
* Queues subscriptions if they are registered before the connection becomes active.
