# Todo — Season List + Smart SQL Editor

## Task 1: Season meta di backend data

**Description:** Tambah SEASONS dan seasonId per episode di data-driven layer tanpa ubah file episode yang sudah ada.

**Acceptance criteria:**
- [ ] `apps/backend/src/data/episodes/index.js` export `SEASONS = [{ id: 1, title: 'Pabrik Sterling', episodeIds: [1,2,3,4,5] }]` dan helper `getSeason(id)`, `getEpisodesBySeason(id)`
- [ ] Tiap episode dari `getEpisodeDefs()` memiliki `seasonId: 1`
- [ ] `pnpm seed` tetap `integrity_check: ok`

**Verification:**
- [ ] Build succeeds: `pnpm --filter @query-noir/web build`
- [ ] Manual check: `GET /api/seasons` belum ada tapi data SEASONS bisa diimport di node

**Dependencies:** None

**Files likely touched:**
- `apps/backend/src/data/episodes/index.js`

**Estimated scope:** Small: 1 file

---

## Task 2: Migrasi progression untuk season summary

**Description:** Tambah migrasi idempoten untuk ringkasan progres per season.

**Acceptance criteria:**
- [ ] `apps/backend/src/db/progression.js` tambah `ensureSeasonProgress()` dengan guard `PRAGMA table_info` dan `try/catch`
- [ ] Reseed dua kali tidak error dan tidak hapus `progress` yang sudah ada
- [ ] Helper `getSeasonSummary()` kembalikan `solved/total` per season

**Verification:**
- [ ] Build succeeds
- [ ] Manual check: reseed dua kali, `progression.db` tetap ada data

**Dependencies:** Task 1

**Files likely touched:**
- `apps/backend/src/db/progression.js`
- `apps/backend/src/db/connection.js`

**Estimated scope:** Small: 1-2 files

---

## Task 3: API GET /api/seasons dan GET /api/seasons/:id

**Description:** Endpoint baru untuk list season dan detail season, reuse mergeWithProgress.

**Acceptance criteria:**
- [ ] `GET /api/seasons` kembalikan `seasons: [{ id, title, episodeCount, solvedCount, episodes: [...] }]`
- [ ] `GET /api/seasons/:id` kembalikan 200 untuk id 1, 404 `Season tidak ditemukan` untuk id 99, validasi id numerik
- [ ] Tidak ubah kontrak `GET /api/episodes` dan `POST /api/execute`

**Verification:**
- [ ] Build succeeds
- [ ] Manual check: curl GET /api/seasons dan GET /api/seasons/1 dan 99

**Dependencies:** Task 2

**Files likely touched:**
- `apps/backend/src/routes/seasons.js`
- `apps/backend/src/index.js`

**Estimated scope:** Medium: 2-3 files

---

## Checkpoint: Foundation

- [ ] Tasks 1-2 pass, seed idempoten, SEASONS terdata
- [ ] Build clean, tidak ada regression episode

---

## Task 4: SeasonList component dan integrasi di play

**Description:** Card per season dengan progress, expand lihat 5 EpisodeRow, reuse gaya amber sidebar.

**Acceptance criteria:**
- [ ] `apps/web/src/components/SeasonList.tsx` render 1 card untuk Season 1 dengan cover, badge `solved/total`, progress bar, tombol expand
- [ ] Expand tampilkan 5 row episode dengan status label dan lock handling yang sama seperti sidebar
- [ ] `play.astro` tampilkan SeasonList di atas GameApp, klik row panggil `selectEpisode`

**Verification:**
- [ ] Build succeeds: `pnpm --filter @query-noir/web build`
- [ ] Manual check: `/play` lihat Season 1 2/5, expand lihat 5 episode, klik Bab 2 load episode

**Dependencies:** Task 3

**Files likely touched:**
- `apps/web/src/components/SeasonList.tsx`
- `apps/web/src/pages/play.astro`
- `apps/web/src/lib/api.ts` tambah `season` types

**Estimated scope:** Medium: 3 files

---

## Task 5: SqlEditor CodeMirror base dengan lint dan autocomplete per episode

**Description:** Ganti Textarea jadi CodeMirror View dengan sql lang, autocompletion per episode, lint gutter, dan Compartment dinamis.

**Acceptance criteria:**
- [ ] `SqlEditor.tsx` pakai `EditorView`, `sql()`, `autocompletion({ override: [episodeCompletion] })`, `lintGutter()`
- [ ] `episodeCompletions(episode)` hasilkan list table dan column dari `episode.tables`
- [ ] `Ctrl+Enter` tetap trigger `onSubmit`, `Tab` terima autocomplete

**Verification:**
- [ ] Build succeeds
- [ ] Manual check: ketik `SEL` autocomplete `SELECT`, ketik `FROM a` lint tampil unknown table, Ctrl+Enter jalan

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/components/SqlEditor.tsx`
- `apps/web/src/lib/completions.ts`

**Estimated scope:** Medium: 2-3 files

---

## Task 6: History hook localStorage klik-ulang

**Description:** Simpan dan tampilkan riwayat query per episode, klik untuk isi editor.

**Acceptance criteria:**
- [ ] `useHistory.ts` hook `push(query)`, `list()`, `clear()` dengan key `query-noir:history:{seasonId}:{episodeId}` cap 50
- [ ] History tampil di bawah editor sebagai list klik-ulang, persist setelah reload
- [ ] Tidak sentuh backend

**Verification:**
- [ ] Build succeeds
- [ ] Manual check: run 3 query, reload, history masih ada, klik isi editor

**Dependencies:** Task 5

**Files likely touched:**
- `apps/web/src/hooks/useHistory.ts`
- `apps/web/src/components/SqlEditor.tsx`

**Estimated scope:** Small: 2 files

---

## Task 7: Toolbar Format dan Export CSV

**Description:** Tombol Format pakai sql-formatter dan Export CSV via Blob.

**Acceptance criteria:**
- [ ] Tombol Format merapikan value editor, jika gagal tampil toast `Format gagal, cek syntax` tanpa ubah value
- [ ] Tombol Export CSV unduh `query.rows` jadi file, jika kosong tampil `Tidak ada hasil untuk diexport`
- [ ] Tidak ubah state query

**Verification:**
- [ ] Build succeeds
- [ ] Manual check: format idempoten, export unduh CSV valid, kosong tampil pesan

**Dependencies:** Task 5

**Files likely touched:**
- `apps/web/src/components/SqlEditor.tsx`
- `apps/web/src/components/ui/toast.tsx` atau inline

**Estimated scope:** Small: 1-2 files

---

## Checkpoint: Editor flow

- [ ] Task 5-7 pass, editor pintar jalan end-to-end

---

## Task 8: Completions dinamis plus shortcut stabil dan polish

**Description:** Pastikan completion source ganti per episode tanpa remount, shortcut stabil di semua browser, polish style amber.

**Acceptance criteria:**
- [ ] `Compartment` ganti `completionSource` saat `episode` berubah tanpa remount EditorView
- [ ] `Ctrl+Enter` dan `Meta+Enter` keduanya trigger `onSubmit` di Win dan Mac
- [ ] Style editor selaras dengan terminal `bg-[#0c0c12]` dan placeholder yang sudah ada

**Verification:**
- [ ] Build succeeds
- [ ] Manual check: ganti Bab 1 ke Bab 2, autocomplete list berubah, Ctrl+Enter dan Cmd+Enter jalan

**Dependencies:** Task 6, Task 7

**Files likely touched:**
- `apps/web/src/components/SqlEditor.tsx`

**Estimated scope:** Small: 1 file

---

## Task 9: Reset progres (frontend + backend)

**Description:** Tambah kemampuan reset progres dari UI, sebelum implementasi task lain agar reset bisa dipakai untuk test season dan editor.

**Acceptance criteria:**
- [ ] `POST /api/progress/reset` atau `POST /api/seasons/reset` hapus `progress` dan kembalikan Bab 1 jadi `available`, 2-5 `locked`, `best_score` 0, tanpa hapus `evidence.db`
- [ ] Validasi hanya terima POST, kembalikan `{ ok: true, seasons: [...] }`
- [ ] `apps/web/src/components/GameApp.tsx` atau `SeasonList.tsx` tampilkan tombol `Reset Progres` dengan dialog konfirmasi `Yakin reset semua progres?`, klik panggil endpoint, lalu refresh `GET /api/seasons` dan `GET /api/episodes`
- [ ] Guard: tombol disabled saat belum ada progres atau saat request loading

**Verification:**
- [ ] Build succeeds
- [ ] Manual check: selesaikan Bab 1, klik Reset, dialog muncul, confirm, Bab 1 kembali available, 2-5 locked, skor 0, reload tetap reset

**Dependencies:** Task 2

**Files likely touched:**
- `apps/backend/src/routes/progress.js` atau `apps/backend/src/routes/seasons.js`
- `apps/backend/src/db/progression.js` fungsi `resetProgress()`
- `apps/backend/src/index.js`
- `apps/web/src/components/GameApp.tsx` atau `SeasonList.tsx`
- `apps/web/src/lib/api.ts` tambah `resetProgress()`

**Estimated scope:** Small: 3-4 files

---

## Checkpoint: Complete

- [ ] All acceptance criteria met
- [ ] `pnpm seed` dan `pnpm build` clean
- [ ] Season list 5 per season dan smart editor flow verified manual
- [ ] Reset progres verified manual
- [ ] Ready for review
