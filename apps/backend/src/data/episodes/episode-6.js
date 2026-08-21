// Bab 6: Faktur Ganda — Fokus: SELECT, WHERE. Kasus #2 tentang pengelapan uang perusahaan.
export const episode6 = {
  id: 6,
  title: 'Faktur Ganda',
  focus: 'SELECT, WHERE',
  brief:
    'Audit triwulan menemukan kejanggalan di pengadaan PT Sterling. Dua faktur dengan nomor sama INV-2025-077 tercatat untuk vendor berbeda, tapi salah satunya fiktif. Tim keuangan menyerahkan tabel invoices lengkap Januari sampai Maret 2025. Temukan siapa yang mengajukan faktur ganda itu.',
  goal:
    'Temukan pengaju (submitted_by) dari faktur bernomor INV-2025-077. Periksa kolom invoice_no dan submitted_by.',
  tables: [
    {
      name: 'invoices',
      columns: [
        { name: 'id' },
        { name: 'vendor' },
        { name: 'invoice_no' },
        { name: 'amount' },
        { name: 'inv_date' },
        { name: 'submitted_by' },
      ],
      rows: [
        [1, 'PT Mandiri Teknik', 'INV-2025-071', 12000000, '2025-01-10', 'P-1002'],
        [2, 'CV Jaya Abadi', 'INV-2025-072', 8000000, '2025-01-15', 'P-1004'],
        [3, 'PT Mandiri Teknik', 'INV-2025-073', 15000000, '2025-01-18', 'P-1001'],
        [4, 'Berkah Kreatif', 'INV-2025-074', 9500000, '2025-01-20', 'P-1005'],
        [5, 'PT Mandiri Teknik', 'INV-2025-075', 11000000, '2025-02-01', 'P-1003'],
        [6, 'CV Jaya Abadi', 'INV-2025-076', 23000000, '2025-02-05', 'P-1004'],
        [7, 'PT Mandiri Teknik', 'INV-2025-077', 75000000, '2025-02-12', 'P-1002'],
        [8, 'Berkah Kreatif', 'INV-2025-077', 75000000, '2025-02-12', 'P-1002'],
        [9, 'PT Mandiri Teknik', 'INV-2025-078', 14000000, '2025-02-18', 'P-1006'],
        [10, 'CV Jaya Abadi', 'INV-2025-079', 9000000, '2025-03-01', 'P-1007'],
        [11, 'PT Mandiri Teknik', 'INV-2025-080', 20000000, '2025-03-10', 'P-1001'],
      ],
    },
  ],
  solution: {
    query: "SELECT submitted_by, vendor, invoice_no FROM invoices WHERE invoice_no = 'INV-2025-077'",
    comment: 'Filter langsung pada nomor faktur yang ganda. Dua baris akan muncul, keduanya diajukan oleh orang yang sama.',
    explanation:
      'Faktur INV-2025-077 muncul dua kali dengan vendor berbeda tapi pengaju sama: P-1002. Satu faktur asli untuk PT Mandiri Teknik, satu lagi duplikat untuk Berkah Kreatif dengan nominal sama 75 juta, diajukan di tanggal yang sama oleh Ratna Sari.',
  },
  culprit: {
    employee_code: 'P-1002',
    name: 'Ratna Sari',
    tokens: ['P-1002', 'Ratna Sari', 'Ratna'],
    verdict:
      'P-1002 (Ratna Sari) mengajukan faktur ganda INV-2025-077 pada 12 Februari untuk dua vendor berbeda dengan nominal identik 75 juta. Pola ini adalah pintu masuk pengelapan dana pengadaan yang ia kelola sebagai Kepala HRD yang juga pegang akses vendor.',
  },
  hints: [
    'Lihat semua invoices, perhatikan kolom invoice_no mana yang muncul dua kali.',
    'Gunakan WHERE invoice_no = nilai yang ganda.',
    'Dua faktur ganda punya vendor berbeda tapi submitted_by sama, itulah pelaku.',
    'Tanggal dan nominal identik adalah petunjuk duplikasi.',
  ],
  redHerrings: [
    'INV-2025-071 sampai 076 terlihat normal, hanya satu duplikat yang janggal.',
    'CV Jaya Abadi dengan nominal besar 23 juta di Februari, tapi nomor faktur unik jadi bukan duplikat.',
  ],
};
