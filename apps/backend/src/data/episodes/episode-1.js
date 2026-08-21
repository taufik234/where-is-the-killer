// Bab 1: Kecelakaan atau Pembunuhan? Fokus: SELECT, WHERE.
export const episode1 = {
  id: 1,
  title: 'Kecelakaan atau Pembunuhan?',
  focus: 'SELECT, WHERE',
  brief:
    'Jam 23:47, penjaga malam menemukan Victor Hale, kepala keamanan, tewas di lantai gudang. Lehernya lecet seperti jeratan, tapi tim forensik bilang itu bisa saja kecelakaan fatal. Gerbang pabrik punya satu pintu masuk yang dicatat sistem akses. Cari tahu siapa, bukan sekedar apa, yang berada di dalam pabrik saat Victor tewas.',
  goal:
    'Temukan siapa yang berada di dalam pabrik pada pukul 23:10 malam itu. Periksa log akses pintu. Setiap karyawan wajib tap kartu masuk dan keluar.',
  tables: [
    {
      name: 'access_log_factory',
      columns: [
        { name: 'id' },
        { name: 'employee_code' },
        { name: 'event' },
        { name: 'timestamp' },
      ],
      rows: [
        [1, 'P-1001', 'IN', '23:02'],
        [2, 'P-1001', 'OUT', '23:03'],
        [3, 'P-1007', 'IN', '23:04'],
        [4, 'P-1003', 'IN', '23:05'],
        [5, 'P-1009', 'OUT', '23:07'],
        [6, 'P-1003', 'OUT', '23:12'],
        [7, 'P-1011', 'IN', '23:13'],
        [8, 'P-1006', 'IN', '23:15'],
        [9, 'P-1001', 'IN', '23:16'],
        [10, 'P-1006', 'OUT', '23:18'],
        [11, 'P-1001', 'OUT', '23:19'],
      ],
    },
  ],
  solution: {
    query:
      "SELECT DISTINCT employee_code FROM access_log_factory al WHERE event = 'IN' AND timestamp <= '23:10' AND NOT EXISTS (SELECT 1 FROM access_log_factory a2 WHERE a2.employee_code = al.employee_code AND a2.event = 'OUT' AND a2.timestamp >= '23:10')",
    comment:
      'Cari orang yang masuk sebelum 23:10 (event IN) dan BELUM tercatat keluar pada atau setelah 23:10. NOT EXISTS menghapus yang sudah keluar.',
    explanation:
      'Di dalam pabrik saat 23:10 ada dua orang: P-1007 (IN 23:04, tidak ada catatan OUT, tidak pernah melapor) dan P-1003 (IN 23:05, OUT 23:12, masih di dalam tapi langsung melapor dan diwawancarai). P-1001 masuk 23:02 tapi sudah keluar 23:03, sebelum kejadian.',
  },
  culprit: {
    employee_code: 'P-1007',
    name: 'Fajar Prasetyo',
    tokens: ['P-1007', 'Fajar Prasetyo', 'Fajar'],
    verdict:
      'P-1007 (Fajar Prasetyo) masuk pukul 23:04 dan TIDAK tercatat keluar sebelum 23:10. Ia masih berada di dalam pabrik saat Victor tewas dan tidak melaporkan diri. Motif: Fajar baru saja ditegur keras oleh Victor karena kehilangan stok gudang senilai puluhan juta.',
  },
  hints: [
    'Mulailah dengan melihat seluruh isi tabel access_log_factory.',
    'Waktu kematian diperkirakan 23:10. Perhatikan kolom event (IN/OUT) bukan hanya timestamp.',
    'Jangan tertipu: satu karyawan tap masuk dua kali malam itu. Ikuti masing-masing transaksi hingga OUT-nya.',
    'Dua orang berada di dalam pabrik saat 23:10. Satu melapor dan diwawancarai; yang satu tidak pernah melapor.',
  ],
  redHerrings: [
    'P-1003 (Irfan Maulana) masuk 23:05 tapi KELUAR 23:12. Alibi: ia langsung melapor ke pos dan diwawancarai penyidik pukul 23:20. Ia masuk lagi 23:16? Tidak, yang masuk 23:16 adalah P-1001.',
    'P-1006 masuk 23:15, setelah jam kematian. Mustahil jadi pelaku.',
  ],
};
