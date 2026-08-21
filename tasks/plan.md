# Implementation Plan: Season List (5 per Season) + Smart SQL Editor

## Overview

Tambah pengelompokan 5 episode per Season dan upgrade SqlEditor jadi CodeMirror 6 pintar. Season pertama Pabrik Sterling berisi Ep 1-5 yang ada. Editor dapat autocomplete tabel/kolom per episode, lint gutter, history localStorage, format, export CSV, dan Ctrl+Enter stabil. Tetap reuse kontrak execute/solve yang ada.

## Architecture Decisions

- Season sebagai entitas data di `index.js` plus `SEASONS` meta, bukan tabel baru. Alasan: episode sudah data-driven, season cukup meta agar `id + 1` unlock tetap jalan.
- Migrasi `progression.db` idempoten dengan `PRAGMA table_info` guard. Alasan: reseed tidak boleh hapus save data.
- `GET /api/seasons` reuse `mergeWithProgress` yang ada. Alasan: tidak duplikasi logika status.
- CodeMirror 6 dipilih karena `lang-sql` sudah terpasang tapi belum dipakai. Alasan: bundle minimal, autocomplete dan lint built-in, tidak perlu ganti backend.
- History di `localStorage` per episode `query-noir:history:{seasonId}:{episodeId}` cap 50. Alasan: no backend sync untuk iterasi 1, sesuai non-goal.

## Task List

### Phase 1: Foundation — Season Model and DB

- [ ] Task 1: Season meta di backend data
- [ ] Task 2: Migrasi progression untuk season summary
- [ ] Checkpoint: Foundation

### Phase 2: Season API and List UI

- [ ] Task 3: API GET /api/seasons dan GET /api/seasons/:id
- [ ] Task 4: SeasonList component dan integrasi di play
- [ ] Checkpoint: Season flow

### Phase 3: Smart Editor

- [ ] Task 5: SqlEditor CodeMirror base dengan lint dan autocomplete per episode
- [ ] Task 6: History hook localStorage klik-ulang
- [ ] Task 7: Toolbar Format dan Export CSV
- [ ] Checkpoint: Editor flow

### Phase 4: Polish and Verify

- [ ] Task 8: Completions dinamis plus shortcut stabil dan polish
- [ ] Task 9: Reset progres (frontend + backend)
- [ ] Checkpoint: Complete

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migrasi progression duplikat atau hapus data | High | Guard PRAGMA dan try/catch, test reseed dua kali |
| CodeMirror bundle bengkak | Medium | Import hanya sql lang dan view core, lazy load jika perlu |
| Completion tidak akurat per episode | Medium | Sumber dari episode.tables yang sudah ada, unit test |
| localStorage quota | Low | Cap 50 per episode, clear oldest |

## Open Questions

- Palet Season 2 tetap amber atau beda.
- Sync history ke backend cross device ditunda.

## Parallelization

- Task 5 dan Task 4 bisa paralel setelah Task 2 selesai karena tidak share state.
- Task 6 dan 7 paralel setelah Task 5.

Tasks tracked in `tasks/todo.md`
