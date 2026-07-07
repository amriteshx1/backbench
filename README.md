# Backbench

Practice real backend engineering through hands-on API, database, queue, worker, and distributed systems challenges.

## Stack

- **Web:** Next.js + shadcn/ui
- **API:** Express + Socket.IO
- **Worker:** BullMQ + Docker evaluation
- **Data:** Postgres (Prisma) + Redis

## Prerequisites

- Node.js 20+
- Docker (for Postgres/Redis locally, and for submission evaluation)
- npm (workspaces)

## Quick start (local dev)

1. Install dependencies:

```bash
npm install
```

2. Copy env and adjust if needed:

```bash
cp .env.example .env
```

3. Start infrastructure:

```bash
docker compose -f infra/docker-compose.yml up -d postgres redis
```

4. Run database migrations:

```bash
npm run db:migrate
```

5. Seed challenge catalog:

```bash
npm run seed:challenges
```

6. Start apps (separate terminals):

```bash
npm run dev -w @backbench/api
npm run dev -w @backbench/worker
npm run dev -w @backbench/web
```

7. Open the app:

- Web: http://localhost:3000
- API health: http://localhost:4000/health
- Worker health: http://localhost:4001/health

## Full Docker stack

```bash
docker compose -f infra/docker-compose.yml up --build
docker compose -f infra/docker-compose.yml exec api npm run seed:challenges -w @backbench/api
```

Use `.env.docker` values when running everything in Compose (service hostnames like `postgres` and `redis`).

## MVP flow

1. Sign up / log in
2. Browse `/challenges`
3. Open a challenge workspace
4. Edit starter files and submit
5. Watch status update (Socket.IO + polling fallback)
6. View score, tests, logs, and persisted results after refresh

## Useful commands

```bash
npm run typecheck
npm run build
npm run seed:challenges
npm run db:migrate
npm run db:generate
```

## Health checks

- API `/health` reports Postgres + Redis dependency status and returns `503` when degraded.
- Worker `/health` reports queue consumer + dependency status.

## Adding challenges

Challenges live under `challenges/` with:

- `challenge.json` metadata
- `starter-template/` editable files
- `hidden-tests/` evaluation scripts
- `README.md` requirements

After adding or editing challenges, re-run `npm run seed:challenges`.

The catalog includes **45 challenges** (15 easy, 15 medium, 15 hard). Regenerate scaffold files with `npm run generate:challenges` if needed.

## Notes

- Submission evaluation runs in an isolated Docker container (`--network none`, CPU/memory/pids limits).
- Realtime updates are a convenience layer; Postgres remains the source of truth.
- MVP intentionally excludes leaderboards, payments, badges, and org features.
