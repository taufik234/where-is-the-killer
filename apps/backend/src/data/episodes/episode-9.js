// Bab 9: Persetujuan Palsu — Fokus: Subqueries.
export const episode9 = {
  id: 9,
  title: 'Persetujuan Palsu',
  focus: 'Subqueries',
  brief:
    'Setiap transfer di atas 10 juta harus di-approve dua orang. Log approval menunjukkan satu approver anonim selalu menyetujui transfer kecil ke PT Mandiri Teknik, bahkan di hari libur. Sender disamarkan jadi approver_id, petakan lewat approval_map untuk tahu siapa yang meloloskan dana.',
  goal:
    'Temukan approver yang paling sering menyetujui transfer ke PT Mandiri Teknik. Gunakan subquery atau JOIN lewat approval_map.',
  tables: [
    {
      name: 'transfers',
      columns: [
        { name: 'id' },
        { name: 'transfer_date' },
        { name: 'vendor' },
        { name: 'amount' },
      ],
      rows: [
        [1, '2025-01-05', 'PT Mandiri Teknik', 1500000],
        [2, '2025-01-07', 'PT Mandiri Teknik', 1500000],
        [3, '2025-01-09', 'PT Mandiri Teknik', 1500000],
        [4, '2025-01-12', 'PT Mandiri Teknik', 1500000],
        [5, '2025-01-15', 'PT Mandiri Teknik', 1500000],
        [6, '2025-01-18', 'PT Mandiri Teknik', 1500000],
        [7, '2025-01-20', 'PT Mandiri Teknik', 1500000],
        [8, '2025-01-22', 'PT Mandiri Teknik', 1500000],
        [9, '2025-01-25', 'PT Mandiri Teknik', 1500000],
        [10, '2025-01-28', 'PT Mandiri Teknik', 1500000],
        [11, '2025-02-02', 'PT Mandiri Teknik', 1500000],
        [12, '2025-02-05', 'PT Mandiri Teknik', 1500000],
        [31, '2025-01-10', 'CV Jaya Abadi', 8000000],
        [37, '2025-01-12', 'Berkah Kreatif', 5000000],
      ],
    },
    {
      name: 'approvals',
      columns: [
        { name: 'id' },
        { name: 'transfer_id' },
        { name: 'approver_id' },
        { name: 'approved_at' },
      ],
      rows: [
        [1, 1, 'app_004', '2025-01-05 10:00'],
        [2, 2, 'app_004', '2025-01-07 10:00'],
        [3, 3, 'app_004', '2025-01-09 10:00'],
        [4, 4, 'app_004', '2025-01-12 10:00'],
        [5, 5, 'app_002', '2025-01-15 11:00'],
        [6, 6, 'app_004', '2025-01-18 10:00'],
        [7, 7, 'app_004', '2025-01-20 10:00'],
        [8, 8, 'app_002', '2025-01-22 11:00'],
        [9, 9, 'app_004', '2025-01-25 10:00'],
        [10, 10, 'app_004', '2025-01-28 10:00'],
        [11, 11, 'app_004', '2025-02-02 10:00'],
        [12, 12, 'app_004', '2025-02-05 10:00'],
        [13, 31, 'app_002', '2025-01-10 11:00'],
        [14, 37, 'app_003', '2025-01-12 11:00'],
      ],
    },
    {
      name: 'approval_map',
      columns: [
        { name: 'approver_id' },
        { name: 'employee_code' },
      ],
      rows: [
        ['app_001', 'P-1001'],
        ['app_002', 'P-1002'],
        ['app_003', 'P-1003'],
        ['app_004', 'P-1004'],
        ['app_005', 'P-1005'],
      ],
    },
  ],
  solution: {
    query:
      "SELECT m.employee_code, COUNT(*) as total FROM approvals a JOIN approval_map m ON a.approver_id = m.approver_id JOIN transfers t ON t.id = a.transfer_id WHERE t.vendor = 'PT Mandiri Teknik' GROUP BY m.employee_code ORDER BY total DESC LIMIT 1",
    comment: 'JOIN approvals ke approval_map lalu ke transfers, filter vendor PT Mandiri Teknik, hitung per approver.',
    explanation:
      'Dari 12 approval untuk PT Mandiri Teknik, 10 dilakukan oleh app_004 yang dipetakan ke P-1004. Approver lain hanya 2 kali. Pola ini menunjukkan satu orang meloloskan semua pecahan.',
  },
  culprit: {
    employee_code: 'P-1004',
    name: 'Budi Hartono',
    tokens: ['P-1004', 'Budi Hartono', 'Budi', 'app_004'],
    verdict:
      'P-1004 (Budi Hartono) sebagai operator mesin yang diberi hak approval darurat, menyetujui 10 dari 12 transfer kecil ke PT Mandiri Teknik, termasuk di hari libur. Ia adalah kaki tangan yang meloloskan dana.',
  },
  hints: [
    'Lihat approvals dan filter yang vendor-nya PT Mandiri Teknik, butuh JOIN ke transfers.',
    'Petakan approver_id ke employee_code lewat approval_map.',
    'GROUP BY employee_code dan COUNT, lalu ORDER BY total DESC.',
    'Satu approver mendominasi, itulah yang meloloskan pecahan.',
  ],
  redHerrings: [
    'app_002 (Ratna) hanya 2 approvals, terlihat aktif tapi bukan dominan.',
    'app_003 (Irfan) hanya 1 approval untuk Berkah Kreatif, bukan untuk PT Mandiri Teknik.',
  ],
};
