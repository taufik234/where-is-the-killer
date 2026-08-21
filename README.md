# Query Noir - SQL Detective Game

Tulis SQL untuk menginterogasi database bukti dan pecahkan 5 kasus pembunuhan berantai di Pabrik Sterling. Setiap bab menguji satu teknik SQL. Bukan tutorial, ini ruang interogasi.

Monorepo `pnpm` - backend `Express 5 + better-sqlite3` di `:8787`, frontend `Astro 5 + React 19 + Tailwind 4` di `:4321`. Produksi disajikan dari satu port yang sama.

## Demo

```
pnpm install
pnpm seed
pnpm dev
```

Buka `http://localhost:4321`, pilih Bab 1, jalankan `SELECT * FROM access_log_factory`.

Produksi: `pnpm start` build frontend lalu serve dari backend di satu port.

## Cara main

Setiap episode punya satu database bukti yang berbeda. Kamu baca ringkasan kasus dan tujuan, lalu tulis query di editor. Hasil tabel muncul di bawah. Ketika yakin, ketik nama atau kode pelaku di kolom tebakan. Jawaban benar membuka bab berikutnya dan menghitung skor.

Skor per bab: `max(0, 1000 - 40×query - 150×salah)`. `POST /api/episodes/:id/start` mereset percobaan. Hint tidak mengurangi skor. Skor terbaik per bab disimpan dengan `MAX`, total adalah penjumlahan skor terbaik.

## Struktur

```
apps/backend          Express API, dua SQLite, data-driven episodes
  src/data/episodes   definisi bab 1 sampai 5 - tabel, baris, solusi, pelaku, hints
  src/routes          episodes, execute, solve, hints
  src/services        executor dan solver
  src/db              connection dan progression
  data/               evidence.db dan progression.db (gitignored)
apps/web              Astro + React
  src/components      GameApp, StoryPanel, SqlEditor, ResultTable
  src/lib/api.ts      wrapper fetch yang mirrors kontrak backend
  src/styles          global.css - palet noir, grid halus, vignette
DESIGN.md             arah visual, dial ENERGY 2 / RHYTHM 1 / MOTION 1
```

## Setup

Butuh `Node >=20` dan `pnpm`.

```bash
pnpm install
pnpm seed              # bangun evidence.db dari definisi episode dan reset progression.db
pnpm --filter @query-noir/backend dev   # backend di :8787 dengan --watch
pnpm --filter @query-noir/web dev       # frontend di :4321
pnpm dev               # jalankan keduanya paralel

pnpm build             # build semua package
pnpm start             # build lalu serve produksi dari backend
```

Jika `pnpm` diblokir ExecutionPolicy di Windows:

```bash
node apps/backend/src/db/seed.js
powershell -ExecutionPolicy Bypass -Command "pnpm seed"
```

## API

| Method | Path | Body | Catatan |
| --- | --- | --- | --- |
| `GET` | `/api/health` | - | status dan jumlah episode |
| `GET` | `/api/episodes` | - | daftar episode dengan `status` dan `best_score` |
| `GET` | `/api/episodes/:id` | - | detail bab: brief, goal, hints, kolom tabel. `solution` hanya muncul jika status solved |
| `POST` | `/api/execute` | `{ episodeId, sql }` | jalankan query read-only, cap 500 baris |
| `POST` | `/api/solve/:id` | `{ answer }` | kirim nama atau kode pelaku, bukan SQL. Cocok case-insensitive dengan `culprit.tokens` |
| `POST` | `/api/episodes/:id/start` | - | reset `query_count` dan `wrong_attempts` untuk percobaan baru |
| `GET` | `/api/hints/:id?n=0` | - | ambil hint ke-n |

### Keamanan eksekusi SQL

- Allowlist kata pertama `SELECT, WITH, PRAGMA, VALUES, EXPLAIN`. Selain itu ditolak 400.
- `evidence.db` dibuka `readonly: true` saat runtime. Seed saja yang membuka writable.
- Hasil dibatasi 500 baris. Jika terpotong, respons berisi `truncated: true`.
- Jalur solve tidak menjalankan SQL sama sekali. Hanya perbandingan teks terhadap token pelaku.

### Progression

Dua file SQLite terpisah di `apps/backend/data`. `evidence.db` hanya bukti, `progression.db` hanya progres pemain. Reseed bukti tidak menghapus progres, tapi `pnpm seed` sengaja mereset keduanya untuk fresh start. Urutan episode di `apps/backend/src/data/episodes/index.js` menentukan urutan unlock `id + 1`.

## Mengubah data kasus

Semua bab didefinisikan sebagai data di `apps/backend/src/data/episodes/*.js`. Tambah bab baru dengan membuat file baru dan mendaftarkannya di `index.js`. Setelah edit:

```bash
pnpm seed
```

Cek manual: `POST /api/execute` dengan query solusi harus mengembalikan pelaku, lalu `POST /api/solve/:id` dengan jawaban benar harus mengembalikan `correct: true` dan membuka bab berikutnya.

## Frontend

`GameApp.tsx` memegang state episode, query, dan solve. `StoryPanel` menampilkan brief dan goal. `SqlEditor` adalah textarea mono dengan shortcut `Ctrl+Enter`. `ResultTable` menampilkan hasil dengan tiga state: belum pernah run, loading, dan hasil kosong dengan panduan. Navigasi bab di sidebar mengunci bab yang belum terbuka dan menandai yang sudah terpecahkan.

Palet ada di `DESIGN.md` dan `apps/web/src/styles/global.css`. Tema gelap permanen karena konteks terminal noir, bukan tren. Aksen hijau `#22c55e`, tekstur grid tipis dan vignette.

## Verifikasi

Tidak ada test suite otomatis. Verifikasi manual yang dipakai:

- `node apps/backend/src/db/seed.js` harus `integrity_check: ok`
- `GET /api/episodes` harus 5 episode, Bab 1 `available`
- `SELECT * FROM access_log_factory` harus kembali kolom dan baris, `DROP TABLE` harus 400
- Tebak salah menambah `wrongAttempts`, tebak benar menghitung skor dan unlock bab berikutnya

## Lisensi

Privat untuk pengembangan. Episode dan data bukti adalah fiksi untuk pembelajaran SQL.
