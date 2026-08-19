// Bab 4: Skype Murahan — Fokus: Subqueries.
// Riwayat chat korban ditemukan dari file recovery. Pelaku menghapus sebagian
// besar pesan, tapi log server menyimpan sebagian. Sender disembunyikan di
// balik kode anonim (sender_id) — petakan ke karyawan lewat dispatch_log.
export const episode4 = {
  id: 4,
  title: 'Skype Murahan',
  focus: 'Subqueries',
  brief:
    'Tim forensik memulihkan sebagian riwayat chat internal pabrik. Sebagian besar pesan terhapus oleh penyerang, tapi server chat menyimpan log cadangan yang tidak bisa dihapus. Sender disembunyikan di balik kode anonim (sender_id) dan dipetakan lewat tabel dispatch_log.',
  goal:
    'Temukan identitas pengguna yang mengirim pesan paling mengancam ke korban pada malam pembunuhan. Hubungkan sender_id dari pesan ancaman ke karyawan melalui dispatch_log — gunakan subquery.',
  tables: [
    {
      name: 'messages',
      columns: [
        { name: 'id' },
        { name: 'sender_id' },
        { name: 'chat_room' },
        { name: 'sent_at' },
        { name: 'type' },
        { name: 'content' },
      ],
      rows: [
        [1, 'user_004', 'Gudang-L3', '22:58', 'text', 'Kau di mana?'],
        [2, 'user_003', 'Gudang-L3', '22:59', 'text', 'Kau pikir kau bisa sembunyi dari aku?'],
        [3, 'user_002', 'Gudang-L3', '22:59', 'text', 'Jam kerja sudah habis, kenapa ribut?'],
        [4, 'user_003', 'Gudang-L3', '23:00', 'text', 'Aku tahu semua yang kau lakukan.'],
        [5, 'user_007', 'Gudang-L3', '23:01', 'text', 'Malam ini gudang sepi, aman.'],
        [6, 'user_003', 'Gudang-L3', '23:02', 'text', 'Temui aku di lantai tiga. Sendiri.'],
        [7, 'user_009', 'Gudang-L3', '23:03', 'text', 'Itu terlalu berbahaya. Jangan sendirian.'],
        [8, 'user_003', 'Gudang-L3', '23:04', 'text', 'Jangan bawa orang lain. Kalau kau bawa polisi, kau tahu akibatnya.'],
        [9, 'user_001', 'Gudang-L3', '23:05', 'text', 'Ada yang aneh di lantai tiga tadi malam.'],
        [10, 'user_003', 'Gudang-L3', '23:06', 'text', 'Kau sudah menghancurkan hidupku. Sekarang giliranku.'],
        [11, 'user_002', 'Gudang-L3', '23:07', 'text', 'Terlalu banyak drama. Aku pulang.'],
        [12, 'user_003', 'Gudang-L3', '23:08', 'text', 'Datang sekarang, atau aku pastikan semua orang tahu rahasiamu.'],
        [13, 'user_005', 'Gudang-L3', '23:09', 'text', 'Siapa yang masih di gudang? Sabit gudang harus dikunci.'],
        [14, 'user_003', 'Gudang-L3', '23:10', 'text', 'Terlambat. Aku menunggu di dekat pintu darurat.'],
        [15, 'user_009', 'Gudang-L3', '23:11', 'text', 'Sudah cek, pintu darurat terbuka dari dalam.'],
      ],
    },
    {
      name: 'dispatch_log',
      columns: [
        { name: 'sender_id' },
        { name: 'employee_code' },
        { name: 'device' },
      ],
      rows: [
        ['user_001', 'P-1001', 'Pabrik-01'],
        ['user_002', 'P-1002', 'Pabrik-03'],
        ['user_003', 'P-1003', 'Pabrik-02'],
        ['user_004', 'P-1004', 'Pabrik-11'],
        ['user_005', 'P-1005', 'Pabrik-06'],
        ['user_006', 'P-1006', 'Pabrik-09'],
        ['user_007', 'P-1007', 'Pabrik-04'],
        ['user_008', 'P-1008', 'Pabrik-10'],
        ['user_009', 'P-1009', 'Pabrik-08'],
        ['user_010', 'P-1010', 'Pabrik-07'],
      ],
    },
  ],
  solution: {
    query:
      "SELECT d.employee_code, e.name FROM messages m JOIN dispatch_log d ON m.sender_id = d.sender_id JOIN employees e ON e.code = d.employee_code WHERE m.type = 'text' AND (m.content LIKE '%hancur%' OR m.content LIKE '%akibatnya%') ORDER BY m.sent_at",
    comment:
      'Gabungkan messages ke dispatch_log (sender_id) lalu ke employees (employee_code). Cari pesan berisi ancaman ("hancur", "akibatnya") yang dikirim pada rentang malam pembunuhan.',
    explanation:
      'Pesan paling mengancam ("Kau sudah menghancurkan hidupku. Sekarang giliranku.", "Datang sekarang, atau…") datang dari user_003. dispatch_log memetakan user_003 → P-1003 → Irfan Maulana, mantan kepala keamanan yang baru dipecat.',
  },
  culprit: {
    employee_code: 'P-1003',
    name: 'Irfan Maulana',
    tokens: ['P-1003', 'user_003', 'Irfan Maulana'],
    verdict:
      'user_003 = Irfan Maulana (P-1003), mantan kepala keamanan yang dipecat Victor. Ia mengancam korban di chat, lalu memancingnya ke lorong gudang pada malam itu.',
  },
  hints: [
    'Baca isi pesan: mana yang benar-benar ancaman, bukan sekadar percakapan biasa?',
    'sender_id yang sama muncul berulang dengan nada semakin agresif — ikuti dia.',
    'Gunakan JOIN ke dispatch_log untuk memetakan sender_id ke employee_code.',
    'Terakhir, hubungkan employee_code ke employees untuk mendapatkan nama.',
  ],
  redHerrings: [
    'user_002 (Ratna) dan user_009 (Andi) — aktif mengomentari, tapi tidak pernah mengancam.',
    'user_007 (Fajar) — menyebut gudang sepi, penting untuk alibi, tapi bukan pengirim ancaman.',
  ],
};