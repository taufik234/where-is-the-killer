Design Document: Query Noir
1. Arsitektur Monorepo
Struktur direktori proyek:

query-noir/├── package.json (root, setup pnpm workspaces)├── pnpm-workspace.yaml├── apps/│   ├── frontend/ (Astro JS)│   │   ├── src/│   │   │   ├── pages/│   │   │   ├── components/ (React components: SqlEditor, ResultTable)│   │   │   └── layouts/│   │   └── package.json│   └── backend/ (Node.js API)│       ├── src/│       │   ├── index.ts (Express server setup)│       │   ├── routes/ (query.route.ts)│       │   ├── services/ (db.service.ts - SQLite wrapper)│       │   └── database/ (schema.sql, seed.sql, db.sqlite)│       └── package.json└── packages/    └── shared-types/ (Tipe data TypeScript yang dipakai FE & BE)        ├── src/        │   └── index.ts (interfaces: Episode, QueryResult, Suspect)        └── package.json
2. Database Schema Design (Contoh Bab 1)
Backend akan membuat file SQLite lokal. Schema awal:

employees (id, name, role, department, is_suspect)
access_logs (id, employee_id, room, entry_time, exit_time)
cctv_footage (id, camera_id, timestamp, description)
3. API Endpoints
GET /api/episodes/:id: Mengambil cerita, deskripsi kasus, dan list tabel yang tersedia untuk bab tersebut.
POST /api/execute: Menerima body { sql: "SELECT * FROM...", episodeId: 1 }. Mengembalikan { columns: [...], rows: [...], error: null }.
POST /api/validate: Menerima body { suspectId: 5, episodeId: 1 }. Mengembalikan { isCorrect: true/false, nextEpisodeUnlocked: true }.
4. Frontend UI Design
Layout Utama: Split screen. Kiri = Cerita & Petunjuk. Kanan = SQL Editor (atas) & Hasil Tabel (bawah).
SQL Editor: Menggunakan CodeMirror dengan theme dark.
Tabel Hasil: Tampilan tabel responsif dengan limit maksimal 100 baris per query (mencegah DDOS lokal).