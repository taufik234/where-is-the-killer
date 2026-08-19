PRD: SQL Detective Game (Project "Query Noir")
1. Overview
"Query Noir" adalah game detektif berbasis web di mana pemain berperan sebagai Analis Forensik Cyber. Alih-alih mencari petunjuk di lokasi kejadian, pemain harus menulis query SQL untuk menginterogasi database bukti (CCTV, log keuangan, chat) untuk memecahkan kasus pembunuhan.

2. Goals
Membuat game story-driven dengan mekanik SQL.
Game tidak dapat ditamatkan dalam 1 hari (episodic, complex data, red herrings).
Membangun arsitektur monorepo yang memisahkan frontend (Astro) dan backend (Node.js + SQLite).
3. Target Audience
Programmer, Data Analyst, pelajar SQL, dan pencinta game puzzle/detective.
4. Core Gameplay Mechanics
SQL Editor: Pemain menulis SQL di frontend.
Execution: Query dikirim ke backend, dieksekusi di SQLite lokal, dan hasil tabel dikembalikan.
Validation: Sistem mengecek apakah hasil query pemain menemukan "Pelaku" yang benar.
Progression: Episodic (Bab 1 sampai 5). Bab selanjutnya terkunci sampai pelaku diidentifikasi.
Hint System: Jika pemain terjebak, bisa mengakses clue cerita di UI.
5. Tech Stack
Monorepo: pnpm workspaces
Frontend: Astro JS + React (untuk interaktivitas UI & SQL Editor)
Backend: Node.js + Express (atau Fastify) + better-sqlite3
Editor UI: @uiw/react-codemirror (extensions: sql)
Database: SQLite (file lokal .db)
6. Story Outline (Season 1)
Bab 1: Kecelakaan atau Pembunuhan? (Fokus: SELECT, WHERE). Seseorang tewas di pabrik. Pemain harus query log akses pintu untuk melihat siapa yang masuk.
Bab 2: Jejak Digital (Fokus: JOIN, IN). Menghubungkan log ponsel korban dengan data pegawai.
Bab 3: Mengikuti Uang (Fokus: GROUP BY, HAVING, Aggregate). Menemukan anomali keuangan yang membuktikan motif.
Bab 4: Skype murahan (Fokus: Subqueries). Mencari pelaku dari riwayat chat yang dihapus.
Bab 5: Konfrontasi (Fokus: Complex Queries). Menggabungkan semua bukti untuk mengunci pelaku.