// Bab 10: Sidang Direksi — Fokus: Complex Queries. Finale Kasus #2.
export const episode10 = {
  id: 10,
  title: 'Sidang Direksi',
  focus: 'Complex Queries',
  brief:
    'Waktunya menutup Kasus #2. Semua bukti pengelapan dari Bab 6 sampai 9 harus digabungkan. Temukan satu orang yang memenuhi SEMUA kriteria: (1) mengajukan faktur ganda INV-2025-077, (2) rekening pribadinya sama dengan rekening vendor PT Mandiri Teknik, (3) vendornya menerima lebih dari 25 transfer di Q1, (4) menyetujui paling banyak transfer tersebut. Gunakan JOIN, subquery, dan agregasi.',
  goal:
    'Rangkai seluruh bukti menjadi satu query kompleks yang mengembalikan nama otak pengelapan. Satu orang memenuhi semua kriteria.',
  tables: [
    {
      name: 'final_invoices',
      columns: [
        { name: 'id' },
        { name: 'vendor' },
        { name: 'invoice_no' },
        { name: 'submitted_by' },
      ],
      rows: [
        [7, 'PT Mandiri Teknik', 'INV-2025-077', 'P-1002'],
        [8, 'Berkah Kreatif', 'INV-2025-077', 'P-1002'],
        [1, 'PT Mandiri Teknik', 'INV-2025-071', 'P-1001'],
        [2, 'CV Jaya Abadi', 'INV-2025-072', 'P-1004'],
      ],
    },
    {
      name: 'final_employees',
      columns: [
        { name: 'code' },
        { name: 'name' },
        { name: 'bank_account' },
      ],
      rows: [
        ['P-1001', 'Hendra Gunawan', '112233001'],
        ['P-1002', 'Ratna Sari', '112233002'],
        ['P-1003', 'Irfan Maulana', '112233003'],
        ['P-1004', 'Budi Hartono', '112233004'],
        ['P-1006', 'Dewi Anggraini', '998877001'],
        ['P-1010', 'Maya Kusuma', '112233010'],
      ],
    },
    {
      name: 'final_vendors',
      columns: [
        { name: 'vendor_name' },
        { name: 'bank_account' },
        { name: 'owner_code' },
      ],
      rows: [
        ['PT Mandiri Teknik', '112233002', 'P-1002'],
        ['Berkah Kreatif', '556677001', 'P-1005'],
        ['CV Jaya Abadi', '778899001', 'P-1004'],
      ],
    },
    {
      name: 'final_transfers',
      columns: [
        { name: 'id' },
        { name: 'vendor' },
      ],
      rows: [
        [1, 'PT Mandiri Teknik'],
        [2, 'PT Mandiri Teknik'],
        [3, 'PT Mandiri Teknik'],
        [4, 'PT Mandiri Teknik'],
        [5, 'PT Mandiri Teknik'],
        [6, 'PT Mandiri Teknik'],
        [7, 'PT Mandiri Teknik'],
        [8, 'PT Mandiri Teknik'],
        [9, 'PT Mandiri Teknik'],
        [10, 'PT Mandiri Teknik'],
        [11, 'PT Mandiri Teknik'],
        [12, 'PT Mandiri Teknik'],
        [13, 'PT Mandiri Teknik'],
        [14, 'PT Mandiri Teknik'],
        [15, 'PT Mandiri Teknik'],
        [16, 'PT Mandiri Teknik'],
        [17, 'PT Mandiri Teknik'],
        [18, 'PT Mandiri Teknik'],
        [19, 'PT Mandiri Teknik'],
        [20, 'PT Mandiri Teknik'],
        [21, 'PT Mandiri Teknik'],
        [22, 'PT Mandiri Teknik'],
        [23, 'PT Mandiri Teknik'],
        [24, 'PT Mandiri Teknik'],
        [25, 'PT Mandiri Teknik'],
        [26, 'PT Mandiri Teknik'],
        [27, 'Berkah Kreatif'],
        [28, 'CV Jaya Abadi'],
      ],
    },
    {
      name: 'final_approvals',
      columns: [
        { name: 'id' },
        { name: 'transfer_id' },
        { name: 'approver_id' },
      ],
      rows: [
        [1, 1, 'app_002'],
        [2, 2, 'app_002'],
        [3, 3, 'app_002'],
        [4, 4, 'app_002'],
        [5, 5, 'app_002'],
        [6, 6, 'app_002'],
        [7, 7, 'app_002'],
        [8, 8, 'app_002'],
        [9, 9, 'app_004'],
        [10, 10, 'app_004'],
        [11, 27, 'app_003'],
        [12, 28, 'app_005'],
      ],
    },
    {
      name: 'final_approval_map',
      columns: [
        { name: 'approver_id' },
        { name: 'employee_code' },
      ],
      rows: [
        ['app_002', 'P-1002'],
        ['app_004', 'P-1004'],
        ['app_003', 'P-1003'],
        ['app_005', 'P-1005'],
      ],
    },
  ],
  solution: {
    query:
      "WITH duplicate AS (SELECT submitted_by AS code FROM final_invoices WHERE invoice_no = 'INV-2025-077' GROUP BY submitted_by HAVING COUNT(*) > 1), bank_match AS (SELECT e.code FROM final_employees e JOIN final_vendors v ON e.bank_account = v.bank_account WHERE v.vendor_name = 'PT Mandiri Teknik'), many_transfers AS (SELECT vendor FROM final_transfers GROUP BY vendor HAVING COUNT(*) > 25), top_approver AS (SELECT m.employee_code AS code FROM final_approvals a JOIN final_approval_map m ON a.approver_id = m.approver_id GROUP BY m.employee_code ORDER BY COUNT(*) DESC LIMIT 1) SELECT * FROM duplicate d JOIN bank_match b ON b.code = d.code JOIN top_approver t ON t.code = d.code",
    comment:
      'Buat CTE untuk tiap kriteria: duplicate, bank_match, many_transfers, top_approver, lalu JOIN semua pada code. Hanya P-1002 yang ada di semua.',
    explanation:
      'Hanya P-1002 yang muncul di semua: mengajukan faktur ganda INV-2025-077 (2 kali), rekening pribadinya sama dengan PT Mandiri Teknik (112233002), vendornya punya 26 transfer di Q1, dan ia menyetujui 8 transfer terbanyak. Semua mengarah ke Ratna Sari.',
  },
  culprit: {
    employee_code: 'P-1002',
    name: 'Ratna Sari',
    tokens: ['P-1002', 'Ratna Sari', 'Ratna'],
    verdict:
      'Ratna Sari memenuhi seluruh kriteria pengelapan: mengajukan faktur ganda, pemilik rekening hantu, penerima 26 transfer pecahan, dan approver terbanyak. Ia adalah otak Kasus #2.',
  },
  hints: [
    'Uraikan jadi 4 sub-syarat: faktur ganda, rekening hantu, banyak transfer, dan approver terbanyak.',
    'Gunakan CTE atau subquery untuk isolasi tiap syarat.',
    'JOIN semua hasil pada code yang sama.',
    'Pelaku harus muncul di semua tabel, bukan hanya satu.',
  ],
  redHerrings: [
    'P-1004 (Budi) menyetujui 2 transfer, tapi bukan pengaju faktur ganda dan rekeningnya tidak cocok.',
    'Berkah Kreatif hanya 1 transfer, terlihat aktif tapi bukan penerima 26 transfer.',
  ],
};
