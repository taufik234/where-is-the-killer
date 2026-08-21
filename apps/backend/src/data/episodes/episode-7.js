// Bab 7: Rekening Hantu — Fokus: JOIN.
export const episode7 = {
  id: 7,
  title: 'Rekening Hantu',
  focus: 'JOIN',
  brief:
    'PPATK flagged satu rekening vendor yang ternyata milik karyawan internal. Aliran dana 75 juta dari faktur ganda mengalir ke rekening pribadi, bukan rekening perusahaan vendor. Cocokkan rekening pribadi karyawan dengan rekening vendor untuk menemukan pemilik rekening hantu.',
  goal:
    'Temukan karyawan yang rekening pribadinya sama dengan rekening vendor. JOIN emp_accounts dengan vendor_accounts pada kolom bank_account.',
  tables: [
    {
      name: 'emp_accounts',
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
        ['P-1005', 'Siti Rahayu', '112233005'],
        ['P-1006', 'Dewi Anggraini', '998877001'],
        ['P-1007', 'Fajar Prasetyo', '112233007'],
        ['P-1008', 'Lestari Wulandari', '112233008'],
        ['P-1009', 'Andi Saputra', '112233009'],
        ['P-1010', 'Maya Kusuma', '112233010'],
      ],
    },
    {
      name: 'vendor_accounts',
      columns: [
        { name: 'vendor_name' },
        { name: 'bank_account' },
        { name: 'owner_code' },
      ],
      rows: [
        ['PT Mandiri Teknik', '998877001', 'P-1006'],
        ['Berkah Kreatif', '556677001', 'P-1002'],
        ['CV Jaya Abadi', '112233005', 'P-1005'],
        ['PT Sinar Baja', '778899001', 'P-1004'],
      ],
    },
  ],
  solution: {
    query:
      'SELECT e.code, e.name, v.vendor_name FROM emp_accounts e JOIN vendor_accounts v ON e.bank_account = v.bank_account',
    comment: 'JOIN pada bank_account yang sama. Hanya satu pasangan yang rekeningnya identik.',
    explanation:
      'PT Mandiri Teknik memakai rekening 998877001 yang ternyata sama persis dengan rekening pribadi Dewi Anggraini (P-1006). Vendor fiktif itu dimiliki oleh Dewi sebagai pemilik rekening hantu.',
  },
  culprit: {
    employee_code: 'P-1006',
    name: 'Dewi Anggraini',
    tokens: ['P-1006', 'Dewi Anggraini', 'Dewi', '998877001'],
    verdict:
      'P-1006 (Dewi Anggraini) memakai rekening pribadinya 998877001 sebagai rekening vendor PT Mandiri Teknik. Dana 75 juta dari faktur ganda mengalir langsung ke rekeningnya, bukan ke perusahaan.',
  },
  hints: [
    'Bandingkan kolom bank_account di emp_accounts dan vendor_accounts, cari yang nilainya identik.',
    'Gunakan JOIN ON bank_account, bukan code atau name.',
    'Hanya satu vendor yang rekeningnya sama dengan rekening pribadi karyawan.',
    'Vendor dengan rekening hantu itulah yang menerima aliran dana ganda.',
  ],
  redHerrings: [
    'CV Jaya Abadi memakai rekening Siti Rahayu 112233005, tapi transaksi CV normal dan bukan penerima dana ganda.',
    'Berkah Kreatif milik Ratna Sari terlihat mencurigakan di Bab 6, tapi rekeningnya berbeda di kasus ini.',
  ],
};
