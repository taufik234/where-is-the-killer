// Bab 5: Konfrontasi Fokus: Complex Queries.
// Semua bukti sudah di tangan. Kini gabungkan: siapa yang ada di dalam pabrik,
// menelepon korban, mendapat aliran uang fiktif, dan mengirim ancaman. Satu
// orang memenuhi SEMUA kriteria. Gunakan kombinasi JOIN, subquery, dan agregasi.
export const episode5 = {
  id: 5,
  title: 'Konfrontasi',
  focus: 'Complex Queries',
  brief:
    'Waktunya menutup kasus. Seluruh jejak digital yang kamu kumpulkan dari Bab 1 sampai 4 harus digabungkan. Identifikasi satu orang yang memenuhi SEMUA kriteria berikut: (1) berada di dalam pabrik saat kematian, (2) menghubungi nomor korban malam itu, (3) terhubung dengan vendor fiktif, (4) mengirim ancaman via chat. Jawaban akhirmu harus memuat nama pelaku.',
  goal:
    'Rangkai seluruh bukti menjadi satu query kompleks yang mengembalikan nama pelaku. Gunakan JOIN, subquery, dan agregasi. Satu orang memenuhi semua kriteria.',
  tables: [
    {
      name: 'access_log',
      columns: [
        { name: 'id' },
        { name: 'employee_code' },
        { name: 'event' },
        { name: 'timestamp' },
      ],
      rows: [
        [1, 'P-1001', 'IN', '20:00'],
        [2, 'P-1003', 'IN', '20:10'],
        [3, 'P-1005', 'IN', '20:30'],
        [4, 'P-1003', 'OUT', '20:45'],
        [5, 'P-1005', 'OUT', '21:00'],
        [6, 'P-1003', 'IN', '22:10'],
        [7, 'P-1002', 'IN', '22:40'],
        [8, 'P-1002', 'OUT', '22:45'],
        [9, 'P-1003', 'OUT', '23:20'],
        [10, 'P-1005', 'IN', '23:25'],
        [11, 'P-1005', 'OUT', '23:40'],
      ],
    },
    {
      name: 'calls',
      columns: [
        { name: 'id' },
        { name: 'from' },
        { name: 'to' },
        { name: 'time' },
      ],
      rows: [
        [1, '0812-1003', '0812-5000', '22:25'],
        [2, '0812-5000', '0812-1003', '22:28'],
        [3, '0812-1002', '0812-5000', '21:45'],
        [4, '0812-1005', '0812-1003', '22:15'],
        [5, '0812-1005', '0812-5000', '23:30'],
        [6, '0812-1001', '0812-5000', '20:15'],
      ],
    },
    {
      name: 'vendors',
      columns: [
        { name: 'vendor_name' },
        { name: 'owner_code' },
      ],
      rows: [
        ['PT Mandiri Teknik', 'P-1001'],
        ['Berkah Kreatif', 'P-1003'],
        ['CV Jaya Abadi', 'P-1005'],
      ],
    },
    {
      name: 'chat_records',
      columns: [
        { name: 'id' },
        { name: 'sender_code' },
        { name: 'message' },
      ],
      rows: [
        [1, 'P-1003', 'Kau menghancurkan hidupku.'],
        [2, 'P-1005', 'Jangan bawa polisi.'],
        [3, 'P-1003', 'Datang sekarang atau semua orang tahu.'],
        [4, 'P-1001', 'Aku di kantor, sibuk.'],
        [5, 'P-1003', 'Di lorong gudang. Sendiri.'],
        [6, 'P-1005', 'Pintu darurat terbuka dari dalam.'],
      ],
    },
  ],
  solution: {
    query:
      "WITH in_factory AS (\n  SELECT employee_code FROM access_log WHERE event = 'IN' GROUP BY employee_code HAVING COUNT(*) > 1\n),\ncaller AS (\n  SELECT e.code AS employee_code FROM calls c JOIN employees e ON e.phone = c.\"from\" WHERE c.\"to\" = '0812-5000'\n),\nculprit AS (\n  SELECT owner_code FROM vendors WHERE vendor_name = 'Berkah Kreatif'\n),\nthreat AS (\n  SELECT DISTINCT sender_code FROM chat_records WHERE message LIKE '%hancur%' OR message LIKE '%tahu%'\n)\nSELECT * FROM in_factory i\nJOIN caller c ON c.employee_code = i.employee_code\nJOIN culprit r ON r.owner_code = i.employee_code\nJOIN threat t ON t.sender_code = i.employee_code",
    comment:
      'Pendekatan bertahap: buat CTE untuk tiap kriteria, lalu JOIN semuanya pada employee_code. Orang yang muncul di semua hasil adalah pelaku.',
    explanation:
      'Hanya P-1003 yang muncul di semua kriteria: masuk gudang dua kali malam itu (termasuk 22:10 yang menjeda rentang kematian), menelepon nomor korban, pemilik Berkah Kreatif, dan pengirim pesan ancaman. Seluruhnya mengarah pada Irfan Maulana.',
  },
  culprit: {
    employee_code: 'P-1003',
    name: 'Irfan Maulana',
    tokens: ['P-1003', 'Irfan Maulana'],
    verdict:
      'Irfan Maulana memenuhi seluruh kriteria: berada di dalam pabrik, menghubungi korban, pemilik akun fiktif, dan pengirim ancaman. Barang bukti sudah lengkap.',
  },
  hints: [
    'Uraikan kasus menjadi 4 sub-syarat: kehadiran, panggilan, kepemilikan vendor, dan ancaman.',
    'Gunakan CTE atau subquery untuk mengisolasi tiap sub-syarat.',
    'Gabungkan hasil dengan JOIN yang semuanya berujung pada employee_code yang sama.',
    'Pelaku harus muncul di keempat hasil. Periksa siapa yang konsisten di semua tabel.',
  ],
  redHerrings: [
    'P-1005 (Siti) status COD dan ancaman, tapi tidak pernah menelepon korban, dan hanya pemilik CV yang tak terlibat.',
    'P-1001 (Hendra) direktur yang sibuk, tapi tidak ada sangkut paut dengan ancaman.',
  ],
};