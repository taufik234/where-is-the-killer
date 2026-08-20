# Query Noir — SQL Detective Game

Game detektif berbasis web: pemain menulis SQL untuk menginterogasi database bukti
dan memecahkan kasus pembunuhan. Monorepo pnpm: **Astro + React (frontend)** dan
**Express + better-sqlite3 (backend)**.

## Struktur

```
apps/backend    Express API + SQLite (evidence & progression)
apps/web        Astro frontend (Fase 3 — belum dibangun)
```

## Backend

| Endpoint | Deskripsi |
|---|---|
| `GET /api/health` | Status server + jumlah episode |
| `GET /api/episodes` | Daftar episode + status (available/locked/solved) + `best_score` |
| `GET /api/episodes/:id` | Detail episode: brief, goal, hints, kolom tabel |
| `POST /api/execute` | Jalankan query `{ sql }` terhadap evidence DB (read-only, sandox) |
| `POST /api/solve/:id` | Verifikasi jawaban `{ sql }`; benar → episode solved + unlock berikutnya |
| `GET /api/hints/:id?n=0` | Ambil hint ke-n sebuah episode |

### Keamanan eksekusi SQL

- Kata kunci di-allowlist (SELECT / WITH / PRAGMA / ...). `DELETE`, `DROP`, dll ditolak.
- Evidence DB dibuka `readonly: true` — lapisan kedua bahkan jika allowlist lolos.
- Hasil di-cap 500 baris; error parser dikembalikan sebagai `400`, bukan 500.
- Solver memvalidasi hasil query pemain tanpa pernah mengeksekusi ulang query
  sembarang: siswa diverifikasi terhadap token pelaku kanonik + aturan anti-dump
  (hasil harus lebih sedikit dari jumlah baris tabel utama).

### Siklus progression

`progression.db` menyimpan status per episode. Bab 1 `available`, sisanya `locked`.
Saat `/api/solve/:id` benar: status → `solved`, bab berikutnya → `available`.
`evidence.db` hanya data baca; reseed tidak menghapus progres.

## Setup

```bash
pnpm install
pnpm seed        # bangun evidence.db + reset progression.db (fresh start)
pnpm --filter @query-noir/backend dev   # server di :8787
```

## Mengubah data kasus

Semua bukti per bab didefinisikan di `apps/backend/src/data/episodes/*.js`
(struktur tabel + baris, solusi, pelaku, hints, red herrings). Setelah edit:

```bash
pnpm seed
```

> `smoke.js` (utilitas verifikasi manual) dihapus setelah pakai; jalankan ulang
> alur **solve → unlock** dengan mem-posting `/api/solve/:id` untuk tiap episode
> jika data diubah.