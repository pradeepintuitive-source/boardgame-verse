# Project Memory: REST API Documentation (api.md)

This document details the REST API endpoints of the external Spring Boot backend (`https://api.pradeepkulal.click`), as used by the frontend Axios client. All REST endpoints use the standard API prefix (e.g. `/api/`).

---

## Authentication Endpoints (`/api/auth/*`)

### 1. Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Auth Required**: No (Public)
* **Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secretpassword"
}
```
* **Success Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "user": {
    "id": "usr-123",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarColor": "#7c3aed",
    "isGuest": false
  }
}
```
* **Frontend Service Mapping**: `authApi.register()` inside `auth.ts`

### 2. Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Auth Required**: No (Public)
* **Request Body**:
```json
{
  "username": "johndoe",
  "password": "secretpassword"
}
```
* **Success Response (200 OK)**: Same as Register Response.
* **Frontend Service Mapping**: `authApi.login()` inside `auth.ts`

### 3. Guest Login
* **URL**: `/api/auth/guest`
* **Method**: `POST`
* **Auth Required**: No (Public)
* **Request Body**:
```json
{
  "username": "GuestName"
}
```
* **Success Response (200 OK)**: Same as Register Response, with `isGuest` set to true.
* **Frontend Service Mapping**: `authApi.guest()` inside `auth.ts`

### 4. Fetch Active Session User
* **URL**: `/api/auth/me`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**:
```json
{
  "id": "usr-123",
  "username": "johndoe",
  "email": "john@example.com",
  "avatarColor": "#7c3aed",
  "isGuest": false
}
```
* **Frontend Service Mapping**: `authApi.me()` inside `auth.ts`

### 5. Refresh JWT Token
* **URL**: `/api/auth/refresh`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```
* **Success Response (200 OK)**: Same as Register Response.
* **Frontend Service Mapping**: `authApi.refresh()` inside `auth.ts`

### 6. Logout User
* **URL**: `/api/auth/logout`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Empty payload.
* **Frontend Service Mapping**: `authApi.logout()` inside `auth.ts`

---

## Room Management Endpoints (`/api/rooms/*`)

### 1. List Rooms
* **URL**: `/api/rooms`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Request Parameters**:
  * `gameType` (optional, uppercase): `MAFIA` or `MONOPOLY`
* **Success Response (200 OK)**:
```json
[
  {
    "id": "room-1",
    "roomCode": "ABCD",
    "hostUserId": "usr-123",
    "gameType": "MONOPOLY",
    "roomType": "ONLINE",
    "visibility": "PUBLIC",
    "state": "LOBBY",
    "maxPlayers": 8,
    "currentSessionId": null,
    "players": [
      {
        "id": "seat-1",
        "userId": "usr-123",
        "displayName": "johndoe",
        "connected": true,
        "ready": true,
        "aiControlled": false,
        "seatOrder": 0
      }
    ]
  }
]
```
* **Frontend Service Mapping**: `roomsApi.list()` inside `rooms.ts`

### 2. Fetch Room Details
* **URL**: `/api/rooms/{roomId}`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Room DTO object.
* **Frontend Service Mapping**: `roomsApi.get()` inside `rooms.ts`

### 3. Create Room
* **URL**: `/api/rooms`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "gameType": "MONOPOLY",
  "roomType": "ONLINE",
  "visibility": "PUBLIC",
  "maxPlayers": 8
}
```
* **Success Response (200 OK)**: Room DTO object.
* **Frontend Service Mapping**: `roomsApi.create()` inside `rooms.ts`

### 4. Join Room by ID
* **URL**: `/api/rooms/{roomId}/join`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Room DTO object.
* **Frontend Service Mapping**: `roomsApi.join()` inside `rooms.ts`

### 5. Join Room by Code
* **URL**: `/api/rooms/join`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "roomCode": "ABCD"
}
```
* **Success Response (200 OK)**: Room DTO object.
* **Frontend Service Mapping**: `roomsApi.joinByCode()` inside `rooms.ts`

### 6. Leave Room
* **URL**: `/api/rooms/{roomId}/leave`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Empty payload.
* **Frontend Service Mapping**: `roomsApi.leave()` inside `rooms.ts`

### 7. Toggle Ready Status
* **URL**: `/api/rooms/{roomId}/ready`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "ready": true
}
```
* **Success Response (200 OK)**: Empty payload.
* **Frontend Service Mapping**: `roomsApi.ready()` inside `rooms.ts`

### 8. Add AI Bot
* **URL**: `/api/rooms/{roomId}/add-bot`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Room DTO object with new AI player added.
* **Frontend Service Mapping**: `roomsApi.addBot()` inside `rooms.ts`

### 9. Kick Player from Lobby
* **URL**: `/api/rooms/{roomId}/kick`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "playerId": "seat-2"
}
```
* **Success Response (200 OK)**: Empty payload.
* **Frontend Service Mapping**: `roomsApi.kick()` inside `rooms.ts`

---

## Chat Endpoints (`/api/rooms/{roomId}/chat`)

### 1. Fetch Chat History
* **URL**: `/api/rooms/{roomId}/chat`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**:
```json
[
  {
    "id": "msg-1",
    "roomId": "room-1",
    "senderUserId": "usr-123",
    "targetUserId": null,
    "senderName": "johndoe",
    "content": "Hello world!",
    "systemMessage": false,
    "aiMessage": false,
    "sentAt": "2026-07-10T15:26:43Z"
  }
]
```
* **Frontend Service Mapping**: `chatApi.history()` inside `chat.ts`

### 2. Send Message
* **URL**: `/api/rooms/{roomId}/chat`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "content": "Hello world!",
  "targetUserId": null
}
```
* **Success Response (200 OK)**: Chat Message DTO object.
* **Frontend Service Mapping**: `chatApi.sendMessage()` inside `chat.ts`

---

## Game Session Endpoints (`/api/games/*`)

### 1. Start Game
* **URL**: `/api/games/start`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "roomId": "room-1"
}
```
* **Success Response (200 OK)**:
```json
{
  "sessionId": "session-1",
  "roomId": "room-1",
  "gameType": "MONOPOLY",
  "status": "PLAYING",
  "saveVersion": 1,
  "state": {}
}
```
* **Frontend Service Mapping**: `roomsApi.start()` inside `rooms.ts`

### 2. Fetch Game Snapshot
* **URL**: `/api/games/{gameId}`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Game Session payload.
* **Frontend Service Mapping**: `gamesApi.snapshot()` inside `games.ts`

### 3. Fetch Game Log History
* **URL**: `/api/games/{gameId}/log`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Array of game log strings.
* **Frontend Service Mapping**: `gamesApi.log()` inside `games.ts`

### 4. Pause / Resume / End Game
* **URL**: `/api/games/{gameId}/pause` | `/api/games/{gameId}/resume` | `/api/games/{gameId}/end`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Empty payload.
* **Frontend Service Mapping**: `gamesApi.pause()`, `gamesApi.resume()`, `gamesApi.end()` inside `games.ts`

---

## Monopoly Game Endpoints (`/api/monopoly/*`)

### 1. Fetch Monopoly State
* **URL**: `/api/monopoly/{sessionId}`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**: Raw Monopoly state metadata.
* **Frontend Service Mapping**: `monopolyApi.getState()` inside `monopoly.ts`

### 2. Submit Monopoly Move Action
* **URL**: `/api/monopoly/{sessionId}/action`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "type": "ROLL_DICE",
  "tilePosition": null,
  "amount": null,
  "targetPlayerId": null,
  "metadata": null
}
```
* **Success Response (200 OK)**: Empty payload. State is updated on server and broadcast over WebSocket.
* **Frontend Service Mapping**: `monopolyApi.action()` inside `monopoly.ts`
