# YaraLEX

Monorepo containing the YaraLEX platform:

| Service | Description | Local URL |
|---------|-------------|-----------|
| **backend** | FastAPI REST API | http://localhost:8000 |
| **play** | Next.js learner app | http://localhost:3000 |
| **studio** | Next.js creator app | http://localhost:3001 |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

---

## Quick Start (Development)

### 1. Copy the example env file

```bash
cp .env.example .env
```

Edit `.env` if you need Google OAuth (optional):

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Start all services

```bash
docker compose -f compose.dev.yml up --build
```

This will start:

- **MongoDB** on `localhost:27017`
- **Backend (FastAPI)** on `localhost:8000` with hot reload
- **Play (Next.js)** on `localhost:3000` with hot reload
- **Studio (Next.js)** on `localhost:3001` with hot reload

### 3. Open in browser

- Play app: http://localhost:3000
- Studio app: http://localhost:3001
- API docs: http://localhost:8000/docs

### 4. Stop all services

```bash
docker compose -f compose.dev.yml down
```

To also remove volumes (wipes MongoDB data):

```bash
docker compose -f compose.dev.yml down -v
```

---

## Default Credentials

The database is seeded with an admin user on first run:

| Field | Value |
|-------|-------|
| Email | `admin@yaralex.com` |
| Password | `password` (hashed) |

---

## Project Structure

```
api_studio_play/
├── backend/          # FastAPI backend
├── play/             # Next.js learner frontend
├── studio/           # Next.js creator frontend
├── compose.dev.yml   # Dev Docker Compose (all services)
├── .env.example      # Example environment variables
└── .env              # Local environment (not committed)
```

---

## Useful Commands

| Task | Command |
|------|---------|
| Start dev stack | `docker compose -f compose.dev.yml up --build` |
| Start in background | `docker compose -f compose.dev.yml up -d --build` |
| View logs | `docker compose -f compose.dev.yml logs -f` |
| View specific service logs | `docker compose -f compose.dev.yml logs -f backend` |
| Stop all services | `docker compose -f compose.dev.yml down` |
| Stop and remove volumes | `docker compose -f compose.dev.yml down -v` |
| Rebuild a single service | `docker compose -f compose.dev.yml up --build backend` |

---

## Troubleshooting

### Port already in use

If a port is already in use, find and stop the process:

```bash
# Check what's using port 8000
lsof -i :8000

# Or change the port in compose.dev.yml
```

### Fresh start (reset everything)

```bash
docker compose -f compose.dev.yml down -v
docker compose -f compose.dev.yml up --build
```

### Node modules issues

If you have issues with node_modules, clear the volumes:

```bash
docker volume rm api_studio_play_play_node_modules api_studio_play_studio_node_modules
docker compose -f compose.dev.yml up --build
```
