// Bab 2: Jejak Digital Fokus: JOIN, IN.
export const episode2 = {
  id: 2,
  title: 'Jejak Digital',
  focus: 'JOIN, IN',
  brief:
    'Tim forensik memulihkan ponsel Victor dari dalam loker pribadinya, aneh karena ponsel tak pernah jauh dari pemiliknya. Penyidik menetapkan bahwa pelaku menelepon Victor sesaat sebelum pembunuhan untuk memancingnya ke lokasi. Hubungkan data karyawan (employees) dengan call_log yang dipulihkan.',
  goal:
    'Cari tahu karyawan mana yang nomor ponselnya menelepon Victor Hale dalam 1 jam sebelum kematian (22:10 sampai 23:10). Gunakan JOIN atau IN.',
  tables: [
    {
      name: 'employees',
      columns: [
        { name: 'code' },
        { name: 'name' },
        { name: 'role' },
        { name: 'phone' },
      ],
      rows: [
        ['P-1001', 'Hendra Gunawan', 'Direktur Pabrik', '0812-1001'],
        ['P-1002', 'Ratna Sari', 'Kepala HRD', '0812-1002'],
        ['P-1003', 'Irfan Maulana', 'Mantan Keamanan', '0812-1003'],
        ['P-1004', 'Budi Hartono', 'Operator Mesin', '0812-1004'],
        ['P-1005', 'Siti Rahayu', 'Koki Kantin', '0812-1005'],
        ['P-1006', 'Dewi Anggraini', 'Staf Akuntansi', '0812-1006'],
        ['P-1007', 'Fajar Prasetyo', 'Kepala Gudang', '0812-1007'],
        ['P-1008', 'Lestari Wulandari', 'Staf Produksi', '0812-1011'],
        ['P-1009', 'Andi Saputra', 'Admin IT', '0812-1008'],
        ['P-1010', 'Maya Kusuma', 'Sekretaris Direksi', '0812-1010'],
      ],
    },
    {
      name: 'call_log',
      columns: [
        { name: 'id' },
        { name: 'from' },
        { name: 'to' },
        { name: 'time' },
        { name: 'duration' },
        { name: 'type' },
      ],
      rows: [
        [1, '0812-1001', '0812-5000', '20:40', '180', 'out'],
        [2, '0812-1002', '0812-5000', '21:15', '95', 'out'],
        [3, '0812-5000', '0812-1001', '22:55', '40', 'in'],
        [4, '0812-1003', '0812-5000', '21:32', '45', 'out'],
        [5, '0812-1005', '0812-5000', '22:04', '20', 'out'],
        [6, '0812-1002', '0812-1003', '21:45', '600', 'out'],
        [7, '0812-1006', '0812-5000', '22:45', '300', 'out'],
        [8, '0812-5000', '0812-1007', '19:12', '80', 'in'],
        [9, '0812-1008', '0812-5000', '22:38', '45', 'out'],
        [10, '0812-1009', '0812-5000', '22:31', '10', 'out'],
        [11, '0812-1004', '0812-1004', '23:05', '305', 'out'],
        [12, '0812-5000', '0812-1010', '18:00', '120', 'in'],
      ],
    },
  ],
  solution: {
    query:
      'SELECT e.name FROM employees e JOIN call_log c ON c."from" = e.phone WHERE c.type = \'out\' AND c.time BETWEEN \'22:10\' AND \'23:10\' ORDER BY c.time LIMIT 10',
    comment:
      'JOIN employees ke call_log pada nomor ponsel, filter panggilan keluar (out) pada rentang 22:10 sampai 23:10. Perhatikan 0812-1006 (Dewi) OUT 22:45 durasi 5 menit.',
    explanation:
      'Nomor korban 0812-5000. Dari call_log, panggilan dalam jendela 22:10 sampai 23:10: Dewi Anggraini (0812-1006) menelepon korban 22:45 selama 5 menit. Durasi panjang untuk panggilan ke korban, tujuannya memancing keluar.',
  },
  culprit: {
    employee_code: 'P-1006',
    name: 'Dewi Anggraini',
    tokens: ['P-1006', 'Dewi Anggraini', 'Dewi'],
    verdict:
      'Dewi Anggraini menelepon Victor pada 22:45 selama 5 menit. Ia staf akuntansi yang aksesnya dipakai untuk memanipulasi laporan keuangan, dan butuh Victor bungkam.',
  },
  hints: [
    'Telusuri call_log dan employees, perhatikan kolom mana yang cocok untuk digabung (JOIN).',
    'Cek arah panggilan: kolom type (in/out) pada call_log. Pelaku MEMANGGIL korban, bukan sebaliknya.',
    'Waktu kematian 23:10. Carilah panggilan dalam 1 jam sebelum itu.',
    'Satu panggilan OUT pada 22:45 berdurasi 5 menit: sangat panjang untuk panggilan biasa ke korban.',
  ],
  redHerrings: [
    'P-1009 (Andi) menelepon 22:31 singkat, ternyata hanya menanyakan jam kerja, alibi jelas disaksikan tim IT.',
    'P-1003 (Irfan) menelepon 21:32 di luar jendela 1 jam, bukan pemicu pembunuhan.',
  ],
};
