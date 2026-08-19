# Task Execution: Query Noir

> Deviasi dari spesifikasi awal (TypeScript/`shared-types`/`apps/frontend`):
> - **JS ESM, bukan TypeScript** — tidak ada `packages/shared-types`; tipe tidak dipisah ke package tersendiri.
> - **Data-driven** — episode didefinisikan di `apps/backend/src/data/episodes/*.js`, bukan `schema.sql`/`seed.sql`.
> - **Endpoint berbeda**: `/api/episodes`, `/api/episodes/:id`, `/api/execute`, `/api/solve/:id`, `/api/hints/:id` (bukan `/api/episode/:id` + `/api/validate`). Bab 1–5, bukan hanya 1 bab.
> - **Port 8787**, bukan 3000.

## Fase 1: Scaffold Monorepo ✅
- [x] pnpm workspaces (`apps/*`, `packages/*`)
- [x] Root `package.json` scripts: `dev`, `build`, `seed`
- [x] `.gitignore`

## Fase 2: Backend Development (apps/backend) ✅
- [x] Express 5 + better-sqlite3 + cors (`src/index.js`, port 8787)
- [x] Dua DB terpisah: `evidence.db` (readonly saat runtime) + `progression.db` (save data pemain) — reseed tidak menghapus progres
- [x] Seed script `pnpm seed` — bangun evidence.db dari definisi episode + reset progression
- [x] Definisi episode Bab 1–5 (tabel, data dummy, solusi query, pelaku, hints, red herrings)
- [x] SQL executor: allowlist read-only (SELECT/WITH/PRAGMA/VALUES/EXPLAIN), readonly DB, cap 500 baris, error parser → 400
- [x] Solver: validasi token pelaku + anti-scatter (hasil < jumlah baris tabel utama) + unlock episode berikutnya
- [x] API: `/api/health`, `/api/episodes`, `/api/episodes/:id`, `/api/execute`, `/api/solve/:id`, `/api/hints/:id`
- [x] Data diverifikasi: `integrity_check: ok`, semua solusi resolve pelaku
- [x] Smoke test e2e: 5 episode solved berurutan, cascade unlock terbukti

## Fase 3: Frontend Development (apps/web — Astro + React) ✅
- [x] Setup Astro 5 + integrasi React (`@astrojs/react`) + TypeScript + Tailwind 4 (`@tailwindcss/vite`, `@import "tailwindcss"`)
- [x] Layout utama `src/layouts/Layout.astro`
- [x] Halaman `src/pages/index.astro` render komponen `<GameApp />` (`client:load`)
- [x] Komponen `<GameApp />` (TSX) — state game: episode, query, solve, loading, error
- [x] Komponen `<SqlEditor />` — textarea SQL (mode murni browser, tanpa dependensi CodeMirror)
- [x] Komponen `<ResultTable />` — render hasil dari backend
- [x] Komponen `<StoryPanel />` — deskripsi kasus, tujuan, hints (panel kiri)
- [x] Integrasi fetch ke backend (`http://localhost:8787/api/execute`) saat "Run Query"
- [x] Form tebak pelaku → submit ke `/api/solve/:id`
- [x] Badge status episode (available/locked/solved) + UI hint + unlock otomatis bab berikutnya
- [x] `src/lib/api.ts` — tipe + wrapper fetch (episodes, episode detail, execute, solve)

## Fase 4: Integrasi & Polish ⏳ — sebagian
- [x] `pnpm build` — prod build sukses (island JS 188 KB, gzip 58 KB)
- [x] Backend + frontend jalan bersama (`pnpm dev`); `/` → 200; `/api/*` → OK
- [x] Smoke test: execute `SELECT * FROM access_log_factory` → kolom+baris; `DROP` → 400; solve salah → `correct:false` (progres tidak ter-reset)
- [ ] Test manual di browser: ketik query → tabel muncul, tebak pelaku → verdict
- [ ] Serving produksi (deploy/start) — belum dikonfigurasi
- [ ] Polish cerita/UI

## Catatan
- Backend dijalankan via `pnpm --filter @query-noir/backend dev`.
- Setelah mengubah data kasus: `pnpm seed`.
- Error SQL dikembalikan sebagai JSON `400`, tidak pernah crash server.
