# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Query Noir** — SQL detective game (monorepo pnpm). Player writes SQL to interrogate an evidence database and solve a murder across 5 episodic cases. Monorepo: JS ESM backend (`apps/backend`, Express 5 + better-sqlite3, port 8787) and **TypeScript Astro 5 + React 19 frontend** (`apps/web`, Tailwind 4 via `@tailwindcss/vite`, port 4321). UI/server messages are written in Indonesian — keep new copy consistent. The frontend was mostly codegen — verify its calls against the real API contracts in `apps/backend/src/routes/` before trusting it.

## Commands

```bash
pnpm install
pnpm seed              # rebuild evidence.db from episode defs + reset progression.db (fresh start)
pnpm --filter @query-noir/backend dev   # backend server on :8787 (node --watch)
pnpm dev               # runs backend + web in parallel (web absent until Fase 3)
pnpm build             # pnpm -r build
```

No test suite or linter is configured yet — verify backend changes manually by seeding and hitting the API (POST `/api/execute` / `/api/solve/:id`).

## Architecture

Two SQLite databases under `apps/backend/data/` (both gitignored):

- **`evidence.db`** — read-only at runtime (`openEvidenceDb` defaults `readonly: true`; only `seed.js` opens it writable). All evidence content.
- **`progression.db`** — player state (`player`, `progress` with `locked/available/solved` status, `schema_version`). Separate so reseeding evidence never wipes save data; `pnpm seed` resets it deliberately.

### Backend is fully data-driven

`apps/backend/src/data/episodes/*.js` defines every case: tables + rows, solution query, `culprit` (tokens + verdict), hints, red herrings. `index.js` holds `EPISODES` in **id order — order matters** because solve/unlock cascades via `id + 1`. Routes/services contain zero episode-specific logic; new chapters are just a new file + registration in `index.js`. After editing any episode data, run `pnpm seed`.

### SQL execution & solve validation (`src/services/`)

- `executor.js` (`/api/execute`): allowlists first keyword (SELECT/WITH/PRAGMA/VALUES/EXPLAIN), readonly DB as second layer, caps results at 500 rows, maps parser errors to `400`.
- `solver.js` (`/api/solve/:id`): runs the **player's submitted SQL directly** against the readonly evidence DB, then checks result rows for any cell containing a pre-computed culprit token (`culprit.tokens`, e.g. employee code or name). **Anti-scatter rule**: a passing query must return *fewer* rows than the episode's primary table (`def.tables[0]`) — a full-table dump never counts as a solution. On success: `markSolved` + `unlockNext` (id+1).

Note the asymmetry: `/api/execute` and `/api/solve` both execute arbitrary SQL, but only `/api/execute` runs the allowlist. Safety on the solve path relies solely on `readonly: true` — don't remove that.

### Request flow

`src/index.js` (Express 5, port `PORT` or 8787) mounts routers under `src/routes/` (`episodes`, `execute`, `solve`, `hints`). Episode detail and lists merge defs with live `progress` status; solution query is only revealed when status is `solved`.

`src/db/connection.js` is the single source for DB paths; `progression.js` ensures schema on boot (`ensureProgressionDb()`).