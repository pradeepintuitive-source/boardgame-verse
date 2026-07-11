# Project Memory: Deployment & Build Systems (deployment.md)

This document maps out runtime installations, packaging scripts, container configurations, and production routing architectures.

---

## Local Execution Environment

### Prerequisites
* **Runtime**: Node.js v20+ or Bun.
* **Package Manager**: npm or Bun.

### Installation
Clone the repository and run the installation script:
```bash
npm install
```
This builds local dependencies from `package.json` and updates the lock file.

### Running the App
Starts Vite's development server locally on port 3000:
```bash
npm run dev
```

---

## Docker Container Deployments

The repository contains two configurations for container deployments:

### 1. Local Development (`Dockerfile.dev`)
Builds a Node environment running Vite with network mapping enabled.
* **Build Command**:
```bash
docker build -f Dockerfile.dev -t gamehub-client-dev .
```
* **Run Command**:
```bash
docker run -p 3000:3000 -v $(pwd):/app gamehub-client-dev
```
* **Docker Details**: Exposes port 3000. Maps local folders to track file modifications and reload in real-time.

### 2. Static Production Server (`Dockerfile.prod`)
A multi-stage build that compiles static files and serves them via an Nginx container.
* **Stage 1 (Builder)**: Uses `node:20-alpine`, runs `npm install`, and builds production files to the `/dist` directory.
* **Stage 2 (Server)**: Uses `nginx:alpine`, copies the static `/dist` directory contents into the default Nginx public HTML path (`/usr/share/nginx/html`), and exposes port 80.
* **Build Command**:
```bash
docker build -f Dockerfile.prod -t gamehub-client-prod .
```
* **Run Command**:
```bash
docker run -p 80:80 gamehub-client-prod
```

---

## Production Deployment (Vercel Integration)

The frontend is configured for static web hosting platforms like Vercel, but it now targets the Spring Boot backend directly instead of depending on rewrite rules.

### Vercel Routing Configuration (`vercel.json`)
The repository keeps `vercel.json` intentionally minimal. The current deployment shape does not depend on `/api/*` or `/ws/*` rewrites; the client resolves the backend URLs from environment variables and calls the backend domain directly.

---

## Environment Variable Setup (`.env`)

Configure these variables inside a `.env` file at the root directory before running build steps:

* `NEXT_PUBLIC_API_URL`: Base address for REST calls (e.g. `https://api.pradeepkulal.click/api`).
* `NEXT_PUBLIC_WS_URL`: WebSocket endpoint address (e.g. `wss://api.pradeepkulal.click/ws`).
* `VITE_API_URL`: Optional fallback for Vite-only builds or local development.
* `VITE_STOMP_URL`: Optional fallback for Vite-only builds or local development.
