# Project Memory: Environment Configuration (environment.md)

This document details the runtime configuration variables used by the Vite client and the direct backend connection layer.

---

## Environment Variable Schema

### 1. `NEXT_PUBLIC_API_URL`
* **Default Value**: `https://api.pradeepkulal.click/api` (fallback in `api.ts`)
* **Role**: Preferred base URL for Axios REST calls.
* **Usage**: Set this to the backend API origin when deploying to Vercel or other static hosts.

### 2. `NEXT_PUBLIC_WS_URL`
* **Default Value**: `wss://api.pradeepkulal.click/ws` (fallback in `stompClient.ts`)
* **Role**: Preferred WebSocket endpoint for STOMP connections.
* **Usage**: Set this to the backend WebSocket endpoint when running the client outside local development.

### 3. `VITE_API_URL`
* **Default Value**: Optional fallback for local or Vite-only environments.
* **Role**: Alternative base URL for Axios REST calls.
* **Usage**: Useful for local development or non-Next.js hosting setups.

### 4. `VITE_STOMP_URL`
* **Default Value**: Optional fallback for local or Vite-only environments.
* **Role**: Alternative broker URL for STOMP connections.
* **Usage**: Useful when the client needs to connect to a local backend during development.

---

## Configuring Environments

Vite loads variables from files based on the active run mode. Use these file definitions at the root directory:

### 1. Default Variables (`.env`)
Loaded in all environments. Contains direct backend configuration paths:
```ini
NEXT_PUBLIC_API_URL=https://api.pradeepkulal.click/api
NEXT_PUBLIC_WS_URL=wss://api.pradeepkulal.click/ws
```

### 2. Development Overrides (`.env.development`)
Loaded during `npm run dev`. Configures local host backend servers when needed:
```ini
VITE_API_URL=http://localhost:8080/api
VITE_STOMP_URL=http://localhost:8080/ws
```

### 3. Production Variables (`.env.production`)
Loaded during compile builds (`npm run build`). Configures cloud addresses:
```ini
NEXT_PUBLIC_API_URL=https://your-backend-domain/api
NEXT_PUBLIC_WS_URL=wss://your-backend-domain/ws
```

---

## Accessing Variables in Code

Vite exposes environment variables on the `import.meta.env` object.

The client now reads `NEXT_PUBLIC_API_URL` first, then `VITE_API_URL`, and finally falls back to the direct production backend URL.

Example:
```typescript
export const API_BASE_URL =
  (import.meta.env.NEXT_PUBLIC_API_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://api.pradeepkulal.click/api";
```
