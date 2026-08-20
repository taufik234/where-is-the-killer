# Design: Sistem Skor Gameplay (Query Noir)

Tanggal: 2026-08-20. Status: disetujui. Ini iterasi pertama dari total 4 area yang dipilih user (gameplay, visual/UI, konten, progresi & replay) — gameplay dulu karena menjadi fondasi; konten dan replay baru masuk akal sesudahnya.

## Ringkasan

Tambahkan skor numerik transparan per bab, dihitung **server-authoritative** dari aktivitas pemain: jumlah query valid yang dijalankan + jumlah salah tebak. Hint tetap gratis (tidak memengaruhi skor). Skor akhir hanya dihitung pada solve benar. Total skor pemain = jumlah `best_score` per bab; tidak mengunci bab. Replay didukung via endpoint start yang me-reset counter attempt; best-score dipertahankan.

## Keputusan yang sudah dikunci

1. **Sumber skor:** aktivitas pemain (query valid + salah tebak), bukan timer real-time. Server-authoritative.
2. **Hint:** gratis semua — dipakai sebagai jalur belajar SQL, bukan hukuman. Tidak mengurangi skor.
3. **Penyajian:** skor angka rinci + breakdown (query, salah, skor) di layar hasil saat solve benar. Tidak ada counter live di sidebar.
4. **Fungsi skor:** akumulasi jadi Total Skor + (nanti) peringkat; tidak mengunci akses bab berikutnya.
5. **Replay:** counter query/wrong di-reset tiap attempt baru; `best_score` per bab yang dipertahankan; total = sum(best_score).
6. **Pemicu reset:** endpoint eksplisit `POST /api/episodes/:id/start` dipanggil frontend tiap bab dipilih (idempoten).
7. **Riwayat attempt:** tidak disimpan — cukup kolom `best_score` di `progress`. Tidak ada tabel `attempts`.
8. **Pendekatan:** A (server-computed, episode-aware). `/api/execute` menerima `episodeId`; skor dihitung backend, tidak dipercaya dari client.

## Arsitektur & Data Model

Proses state tetap di `progression.db` (terpisah dari `evidence.db`). Migrasi `schema_version` 1 → 2.

Tabel `progress` (update via `ALTER TABLE ... ADD COLUMN`, default aman):

| kolom            | tipe    | default | keterangan |
|------------------|---------|---------|------------|
| `episode_id`     | INTEGER | PK      | eksisting  |
| `status`         | TEXT    | locked  | eksisting (locked/available/solved) |
| `solved_at`      | TEXT    | NULL    | eksisting  |
| `query_count`    | INTEGER | 0       | query valid pada attempt aktif |
| `wrong_attempts` | INTEGER | 0       | salah tebak pada attempt aktif |
| `best_score`     | INTEGER | 0       | skor tertinggi tercapai bab ini |

Reseed (`seed.js`) tetap drop + recreate progression → state bersih.

## Flow API

### `POST /api/execute`
Body: `{ episodeId, sql }`. `episodeId` **wajib** dari frontend (selalu dikirim). Backend **wajib memvalidasi**: tanpa `episodeId` valid → tetap eksekusi SQL tapi **query_count tidak naik** (lihat Anti-regresi). Aturan:
- `sql` valid & dibolehkan allowlist → eksekusi. Bila `episodeId` valid **dan** bab berstatus available/solved → `query_count + 1`.
- SQL error (sintaks / perintah tak diizinkan) → 400; **query_count TIDAK naik** (kesalahan sintaks bukan aktivitas berguna).

### `POST /api/episodes/:id/start` (baru)
- Hanya berlaku bila status bab available/solved; kalau locked → 403/404.
- Set `query_count = 0`, `wrong_attempts = 0`. Idempoten — memanggil berulang aman.
- Return `{ episodeId, queryCount: 0, wrongAttempts: 0 }`.

### `POST /api/solve/:id`
Body `{ answer }`. Evaluasi membandingkan teks dengan `culprit.tokens` (sudah jalan).
- **Salah:** `wrong_attempts + 1` (persisten), respons `{ correct:false, message }`.
- **Benar:** hitung skor → `best_score = max(best_score, skor)`, `status = 'solved'`, `unlockNext(id)`. Respons:
  ```json
  {
    "correct": true,
    "score": 690,
    "breakdown": { "queryCount": 4, "wrongAttempts": 1 },
    "message": "...",
    "verdict": "..."
  }
  ```

## Formula Skor

```
skor = max(0, 1000 − 40×query_count − 150×wrong_attempts)
```

- Hanya dihitung saat solve benar.
- Konstanta: 40/query (efisiensi), 150/salah (akurasi), baseline 1000.
- Contoh: 0–3 query + 0 salah → 880–1000; 4 query + 1 salah → 690; 10 query + 2 salah → 300.
- Hint tidak memengaruhi. Skor tidak pernah negatif (floor 0).

## Frontend (apps/web)

- `api.ts`: `execute(episodeId, sql)`; tambah `start(id)`; perluas `SolveResponse` dengan `score?` + `breakdown?`.
- GameApp `loadEpisode`: setelah `GET /api/episodes/:id`, panggil `POST /api/episodes/:id/start` (tiap bab dipilih — reset attempt baru, idempoten).
- Run Query: `api.execute(episode.id, sql)` — counter naik di server.
- Solve benar: panel hasil tampilkan breakdown (`Query: N · Salah: M · Skor: X`).
- Tidak ada counter live di sidebar — breakdown hanya di layar hasil.
- Error `/start` (bab locked) → tampilkan pesan, jangan reset.

## Migrasi & Anti-regresi

- `ensureProgressionDb`: `SCHEMA_VERSION = 2`; jalankan `ALTER TABLE ... ADD COLUMN` dengan `IF NOT EXISTS`-style guard (SQLite tidak punya `ADD COLUMN IF NOT EXISTS` → gunakan cek pragma/`PRAGMA table_info` atau try/catch).
- `/api/execute` wajib `episodeId` valid — kalau tidak ada/`undefined`, tetap jalankan SQL (kompatibilitas) tapi jangan count. (Keputusan desain: count hanya saat ep valid — lihat bagian Flow API.)
- Skor dihitung server (nilai `score` dari client tidak pernah dipercaya).
- Test manual tanpa suite (pola eksisting): seed → start ep1 → execute ×3 (1 sintaks salah) → solve salah (wrong=1) → execute lagi → solve benar → cek skor 1000−40×4−150×1=690 → start ulang (replay) → counter nol → solve lagi → skor >= sebelumnya → cek `best_score` tetap yang tertinggi.

## Di luar lingkup (iterasi berikut)

- Peringkat/rank tampilan (data siap: total skor).
- Visual/UI overhaul.
- Episode baru (konten) — data-driven, tinggal tambah file episode.
- Mode bebas / statistik mendalam — butuh tabel riwayat attempt (belum dibuat).