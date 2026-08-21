# DESIGN.md — Query Noir

Identitas dan arah visual untuk SQL detective game. Dokumen ini adalah sumber kebenaran desain, antislop.md adalah filternya.

## Identitas

Query Noir adalah game detektif noir berbasis terminal. Pemain adalah investigator yang menginterogasi database bukti, bukan pembaca landing page. Nuansa harus terasa seperti ruang interogasi gelap dengan monitor hijau terminal, bukan SaaS generik.

- **Kepribadian:** tenang, fokus, sedikit tegang, seperti lampu neon redup di kantor polisi malam hari
- **Suasana:** gelap, taktil, kertas dan layar, bukan kaca dan glow

## Palet

Satu aksen hijau terminal `#22c55e` di atas dasar near-black. Tidak ada gradient biru ungu.

- `background #020617` hingga `#0b1120` — deep navy near-black, bukan abu generik
- `primary #22c55e` dengan `primary-foreground #052e16` — hijau terminal untuk aksi dan hasil, kontras 6.5:1
- `muted-foreground #94a3b8` di atas `#0b1120` — kontras 7.3:1, lolos WCAG AA
- `warn #fbbf24` hanya untuk status `Belum benar` yang perlu perhatian, bukan aksen kedua
- `border #1f2937` tipis untuk memisahkan tanpa bayangan

Palet aktif: 2 core plus 1 aksen plus warna peringatan. Neutral tidak dihitung.

## Tipografi

- `font-sans` sistem — judul kasus dan narasi harus terbaca tanpa gaya terminal berlebihan
- `font-mono` JetBrains Mono untuk query, kolom tabel, dan skor — mono dipakai sebagai fungsi bukan estetika
- Label kecil `text-[10px] uppercase tracking-[0.18em] text-muted-foreground` — dipakai hanya untuk label sistem seperti `Editor SQL` dan `SELECT, WHERE` agar hierarki jelas antara label dan judul. Bukan untuk heading paragraf.

## Tekstur

Grid halus 44px opacity 0.04 plus vignette radial. Bukan background grid default. Alasan: memberi rasa kertas milimeter dan sorot lampu meja interogasi tanpa mengganggu keterbacaan. Fixed, non-interaktif, GPU aman. Hanya dua lapisan di `body::before` dan `body::after`.

## Dial

> Reading this as: app detektif terminal untuk pemain yang mengetik SQL, dalam bahasa visual noir terminal, dial ENERGY 2 / RHYTHM 1 / MOTION 1.

- **ENERGY 2** — Balanced. Halaman menyapa dengan jelas tapi tidak berteriak. Fokus ada di story panel dan editor, bukan hero besar.
- **RHYTHM 1** — Uniform dengan sengaja. Semua panel pakai komposisi yang sama `rounded-md border border-primary/20 px-5 py-5` karena pekerjaan di setiap bab identik: baca bukti, tulis query, tebak pelaku. Keseragaman membantu pemain fokus pada konten, bukan layout.
- **MOTION 1** — Calm. Hanya `animate-rise-in` 0.35s untuk feedback `Belum benar` dan `focus-visible` ring. Tidak ada pulse, float, atau loop tak berujung. `prefers-reduced-motion` menonaktifkan animasi sepenuhnya.

## Alasan keputusan utama — R-31

- Warna hijau `#22c55e` — hijau terminal adalah konvensi investigasi dan kontras tinggi di dasar gelap, bukan tren gradient biru ungu
- Tema gelap permanen — alat detektif dan terminal memang gelap, keputusan merek bukan alasan `dark terlihat tech`
- Grid plus vignette — tekstur noir yang memberi kedalaman tanpa blur atau glassmorphism
- Radius `0.5rem` — cukup untuk melembutkan kartu tanpa jadi pill di semua elemen
- Shadow `shadow-none` di kartu — elevasi disampaikan lewat border `primary/20` dan spacing, bukan bayangan mengambang
- Ikon `BookOpen` untuk bab pengantar, `Search` untuk kasus aktif, `Lock` untuk terkunci, `Check` untuk terpecahkan — setiap ikon menandai status progresi yang dapat diverifikasi, bukan dekorasi sparkle generik

## Catatan implementasi

- Placeholder `placeholder:text-slate-600` sebelumnya gagal kontras 2.48:1, diganti ke `placeholder:text-muted-foreground/60` agar tetap terbaca
- Empty state tabel dibedakan antara belum pernah run dan hasil kosong
- Semua navigasi sidebar adalah episode yang ada, tidak ada ghost link
