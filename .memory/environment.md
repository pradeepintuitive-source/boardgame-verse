# Project Memory: Environment Configuration (environment.md)

This document details the configuration variables used by Vite's bundler runtime.

---

## Environment Variable Schema

### 1. `VITE_API_URL`
* **Default Value**: `/api` (fallback in `api.ts`)
* **Role**: Configures the base URL for the Axios HTTP client. All REST endpoints use this address prefix.
* **Usage**:
  * In local development, defaults to `/api` which is routed via proxy rewrites.
  * In production, points to the reverse proxy domain route to bypass browser CORS headers.

### 2. `VITE_STOMP_URL`
* **Default Value**: `null` (falls back to offline/local simulation mode)
* **Role**: Configures the broker URL for the STOMP connection client.
* **Usage**:
  * Set to `https://api.pradeepkulal.click/ws` to connect to the external Spring Boot server.
  * If left empty or invalid, the WebSocket engine automatically operates in offline mode. Local simulation engines (`mafiaEngine.ts` and `monopolyEngine.ts`) drive game state changes inside Zustand stores.

---

## Configuring Environments

Vite loads variables from files based on the active run mode. Use these file definitions at the root directory:

### 1. Default Variables (`.env`)
Loaded in all environments. Contains default configuration paths:
```ini
VITE_API_URL=/api
VITE_STOMP_URL=https://api.pradeepkulal.click/ws
```

### 2. Development Overrides (`.env.development`)
Loaded during `npm run dev`. Configures local host backend servers:
```ini
VITE_API_URL=http://localhost:8080/api
VITE_STOMP_URL=http://localhost:8080/ws
```

### 3. Production Variables (`.env.production`)
Loaded during compile builds (`npm run build`). Configures cloud addresses:
```ini
VITE_API_URL=https://mygamehubdomain.com/api
VITE_STOMP_URL=wss://mygamehubdomain.com/ws
```

---

## Accessing Variables in Code

Vite exposes environment variables on the `import.meta.env` object.

To prevent leaks, only variables prefixed with `VITE_` are injected into the client bundle.

Example:
```typescript
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";
```
