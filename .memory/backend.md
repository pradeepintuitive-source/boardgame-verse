# Project Memory: Reconstructed Backend Architecture (backend.md)

## Backend System Overview
The external backend is built as a Spring Boot Java application designed for stateless REST operations, WebSocket message distribution, and real-time state management. Because backend source code is not direct workspace source, this analysis is reconstructed from the REST client endpoints, parameters, models, and WebSocket handshake mechanisms used in the frontend.

---

## Package Architecture (Reconstructed Spring Boot Structure)
```text
com.gamehub.backend/
├── config/                  # Configuration beans
│   ├── SecurityConfig.java  # JWT filters, password encoders, cors, request rules
│   ├── WebMvcConfig.java    # Vercel bypass settings, CORS mapping overrides
│   └── WebSocketConfig.java # STOMP broker setup, SockJS fallbacks, connection handshakes
├── controller/              # REST & STOMP Request Handlers
│   ├── AuthController.java  # Login, registration, guest session generation
│   ├── RoomController.java  # Room creation, joining, status updates, kicking players
│   ├── ChatController.java  # Historical message retrievals, chat persistence
│   ├── GameController.java  # Game lifecycle triggers (start, pause, resume, end)
│   ├── MessageController.java # STOMP message mapped controllers (@MessageMapping)
│   └── MonopolyController.java # Monopoly state reads and action updates
├── service/                 # Core Business Logic Layer
│   ├── AuthService.java     # Username verification, hashing, JWT token creation
│   ├── RoomService.java     # Room state, seats, bot generation logic
│   ├── ChatService.java     # Message records and room distributions
│   └── MonopolyService.java # Monopoly rules engine (rolls, transactions, bidding, trades)
├── repository/              # Spring Data JPA Repository Layer
│   ├── UserRepository.java
│   ├── RoomRepository.java
│   ├── MessageRepository.java
│   └── GameSessionRepository.java
├── model/                   # Database Entities & Mappings
│   ├── User.java
│   ├── Room.java
│   ├── RoomPlayer.java      # Joined players, seats, connections, ready state
│   ├── ChatMessage.java
│   └── GameSession.java     # Generic game session mapping JSON state structures
└── dto/                     # Data Transfer Objects / Request Envelopes
    ├── AuthRequest.java
    ├── AuthResponse.java
    ├── CreateRoomRequest.java
    ├── MonopolyActionRequest.java # Mapping of player events sent over socket
    ├── RoomDto.java         # Serialized Room information
    └── ErrorResponse.java   # Standard API error envelope
```

---

## Key Backend Components

### 1. Controllers (REST API & STOMP)
* **REST Controllers (`@RestController`)**: Expose the endpoints documented in `api.md`. Request parameters are parsed using `@RequestBody`, `@PathVariable`, and `@RequestParam`.
* **STOMP Controllers (`@Controller` with `@MessageMapping`)**: Handle socket messages. Endpoint routes (e.g. `@MessageMapping("/rooms/{roomId}/ready")`) extract context from client tokens and call shared service methods.

### 2. Service Logic Layer (`@Service`)
* **RoomService**: Maintains room lifecycles. On changes (join, leave, ready toggle), it invokes `SimpMessagingTemplate.convertAndSend` to broadcast updates to `/topic/rooms/{roomId}`.
* **MonopolyService**: Evaluates actions sent by clients. Implements Monopoly rules (bidding, transactions, mortgage, house limits). On changes, it broadcasts updates to `/topic/games/{gameId}`.

### 3. Repository Layer (`@Repository`)
* Extends `JpaRepository` or `CrudRepository` to communicate with the SQL database.
* Features queries such as `findByRoomCode(String code)` or `findByGameType(String gameType)`.

### 4. Database Entities & DTO Mapping
* Entities use standard JPA annotations (`@Entity`, `@Table`, `@Id`, `@GeneratedValue`).
* Relationships:
  * A `Room` has a one-to-many relationship with `RoomPlayer`.
  * `RoomPlayer` stores a reference to a `User` or guest model.

---

## Security Framework (Spring Security)
* **Authentication**: Stateless architecture using JSON Web Tokens (JWT).
* **Spring Security Flow**:
  1. Incoming HTTP requests pass through `JwtAuthenticationFilter`.
  2. The filter extracts the Bearer token from the `Authorization` header.
  3. The token is validated using a signing key. User identity is set in Spring Security's `SecurityContextHolder`.
  4. Unauthenticated endpoints (e.g. `/api/auth/login`, `/api/auth/register`, `/api/auth/guest`) bypass validation rules.
* **WebSocket Handshake Auth**:
  * WebSocket upgrades cannot include custom headers, so the frontend passes the JWT token as a URL query parameter (`token=`).
  * A backend `HandshakeInterceptor` extracts the token, validates it, and registers the user principal in the WebSocket connection state.
  * Subsequent STOMP messages are authorized based on this registered principal.

---

## Exception Handling
* The backend returns a standard JSON error payload:
```json
{
  "timestamp": "2026-07-10T15:26:43Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid move: Player has insufficient cash.",
  "details": ["Required cash: 150", "Available cash: 120"],
  "path": "/api/monopoly/session-123/action"
}
```
* Global exception handling is configured using `@RestControllerAdvice` and `@ExceptionHandler` annotations.
* Standard exception types include:
  * `BadCredentialsException` -> 401 Unauthorized
  * `EntityNotFoundException` -> 404 Not Found
  * `IllegalStateException` / `IllegalArgumentException` -> 400 Bad Request
