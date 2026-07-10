# Project Memory: Docker Implementations (docker.md)

This document details the Dockerfile configurations, exposed network ports, and image build steps.

---

## Dockerfile Blueprint Comparison

| Setting | Development (`Dockerfile.dev`) | Production (`Dockerfile.prod`) |
| :--- | :--- | :--- |
| **Base Image** | `node:20-alpine` | Stage 1: `node:20-alpine` <br> Stage 2: `nginx:alpine` |
| **Workspace Path** | `/app` | `/app` |
| **Installation** | `npm install` | `npm install` |
| **Commands** | `npm run dev -- --host` | Stage 1: `npm run build` <br> Stage 2: serves static `/app/dist` |
| **Ports** | `3000` | `80` |
| **Volume Mounts** | Bind mount local directory to `/app` | None (Self-contained image) |

---

## Dev vs Prod Image Builds

### 1. Dev Configuration (`Dockerfile.dev`)
Optimized for local hot reloading.
* **Build command**:
```bash
docker build -f Dockerfile.dev -t gamehub-client:dev .
```
* **Run command**:
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --name gamehub-dev-container \
  gamehub-client:dev
```
* **Volume Mapping**:
  * `-v $(pwd):/app`: Maps local file changes directly into the container.
  * `-v /app/node_modules`: Prevents local node packages from overriding the packages installed inside the container.

### 2. Prod Configuration (`Dockerfile.prod`)
Builds a lightweight static Nginx container.
* **Build command**:
```bash
docker build -f Dockerfile.prod -t gamehub-client:latest .
```
* **Run command**:
```bash
docker run -d \
  -p 80:80 \
  --name gamehub-prod-container \
  gamehub-client:latest
```

---

## Recommended Compose Stack (`docker-compose.yml`)

The repository does not contain a `docker-compose.yml` file. If running a local stack containing both this client and a local database + Spring Boot backend, use the following template at the project root:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8080/api
      - VITE_STOMP_URL=http://localhost:8080/ws
    depends_on:
      - backend

  backend:
    image: gamehub-backend:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/gamehub
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=secret
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=gamehub
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```
