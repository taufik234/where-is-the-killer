# Design: Season List (5 per Season) + Smart SQL Editor — Query Noir

Date: 2026-08-21
Status: Draft for review
Approach: Pendekatan 2 CodeMirror 6 + Season Model

## 1. Overview

Tambah pengelompokan episode jadi `Season` dengan 5 episode per season dan tingkatkan `SqlEditor` jadi pintar. Season pertama `Kasus #1: Pabrik Sterling` berisi Ep 1-5 yang sudah ada. Editor baru punya autocomplete tabel dan kolom per episode, lint error sebelum run, plus toolbar History, Format, Export CSV, dan shortcut stabil. Tujuan: navigasi kasus lebih jelas dan pengalaman tulis SQL lebih dekat ke tool beneran tanpa mengubah kontrak `POST /api/execute` dan `POST /api/solve`.

## 2. Goals and Non-Goals

Goals:
- List season yang tiap list tampilkan 5 episode dengan status terpecahkan, progres, dan expand.
- Autocomplete akurat per episode dan lint gutter sebelum eksekusi.
- History klik-ulang, format, export CSV, Ctrl+Enter stabil.

Non-Goals:
- Tidak tambah season 2 atau episode 6-10 di iterasi ini, hanya model dan UI siap.
- Tidak ubah scoring atau unlock logic `id + 1`.
- Tidak pakai AI untuk saran query.

## 3. Architecture

- Data: `apps/backend/src/data/episodes/index.js` tambah `SEASONS = [{ id: 1, title: 'Pabrik Sterling', episodeIds: [1,2,3,4,5] }]` dan tiap episode dapat `seasonId`.
- DB: `progression.db` tambah view `season_summary` di `src/db/progression.js` via `ensureSeasonProgress()` dengan guard `PRAGMA table_info`. Tidak hapus data lama, migrasi idempoten.
- API: `src/routes/seasons.js` baru handle `GET /api/seasons` dan `GET /api/seasons/:id` reuse `mergeWithProgress`. Endpoint episode, execute, solve tetap sama.
- Frontend: `play.astro` tetap jadi shell, tambah `SeasonList.tsx` di atas `GameApp`. `SqlEditor.tsx` ganti implementasi ke CodeMirror via `EditorView`, `sql()`, `autocompletion`, `lintGutter`, `keymap`. History di `localStorage` key `query-noir:history:{seasonId}:{episodeId}`.

Dials: `ENERGY 2 / RHYTHM 1 / MOTION 1` tetap, season list ikut ritme 1 agar konsisten.

## 4. Components

- `seasonMeta.js`: `SEASONS`, `getSeason(id)`, `getEpisodesBySeason(id)`.
- `routes/seasons.js`: validasi id numerik, respon `404 Season tidak ditemukan`.
- `SeasonList.tsx`: card per season dengan cover, badge `solved/total`, progress bar, expand lihat 5 `EpisodeRow` reuse gaya sidebar amber. Prop `seasons: SeasonSummary[]`.
- `SqlEditor.tsx`: `EditorView`, `Compartment` untuk ganti `completionSource` per episode, `autocompletion({ override: [episodeCompletion] })`, `lintGutter()`, toolbar `Format` pakai `sql-formatter`, `Export` via `Blob`.
- `useHistory.ts`: hook `push(query)`, `list()`, `clear()` dengan cap 50 entri per episode.
- `episodeCompletions(episode)`: hasilkan list `table` dan `column` dari `episode.tables` untuk `completionSource`.

## 5. Data Flow

- Season: `SeasonList` fetch `GET /api/seasons` saat mount. Setelah `POST /api/solve/:id` correct, panggil `GET /api/seasons` ulang untuk refresh progress tanpa reload. Jika season locked, row disabled bukan error.
- Editor: `GameApp.loadEpisode(id)` dapat `episode.tables`, teruskan ke `SqlEditor` via prop `completions`. `SqlEditor` buat `Compartment` ganti source dinamis. Lint jalan lokal via parser `sql()`, tampil `unknown table` di gutter. History tidak sentuh backend. Export baca `query.rows` dari state `GameApp`.

## 6. Error Handling

- Migrasi `season_progress` pakai `try/catch` dan guard `PRAGMA table_info` agar tidak duplikat.
- `GET /api/seasons/:id` validasi id, kembalikan `404` jika tidak ada.
- `Format` gagal tampil toast `Format gagal, cek syntax` tanpa ubah value.
- `Export` kosong tampil `Tidak ada hasil untuk diexport`.
- Editor error non-blocking, user tetap bisa `Run Query` dan dapat `400` dari `executor.js`.

## 7. Testing

- Seed: verify season 5 per list dan completions per episode.
- Manual: `Tab` autocomplete, `Ctrl+Enter`, lint gutter, history persist setelah reload, format idempoten, export unduh CSV valid.
- Unit: `episodeCompletions` dan `season_summary` hitung `solved/total`.

## 8. Rollout

1. Backend season model dan migrasi.
2. API `GET /api/seasons`.
3. Frontend `SeasonList` di atas `GameApp`.
4. `SqlEditor` CodeMirror plus toolbar.
5. Verify `pnpm seed`, `pnpm build`, manual flow season dan editor.

## 9. Open Questions

- Apakah Season 2 akan punya palet berbeda atau tetap noir amber.
- Apakah history perlu sync ke backend untuk cross device, ditunda iterasi 2.
