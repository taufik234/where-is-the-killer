import { getEpisodeDefs } from '../data/episodes/index.js';
import { QueryError } from './executor.js';
import { openProgressionDb } from '../db/progression.js';

const EPISODE_DEFS = getEpisodeDefs();

// Normalisasi jawaban: huruf kecil, spasi berlebih dirapikan.
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

// Check whether the player's answer matches the culprit (name/kode/nama vendor/etc).
// Tidak lagi menjalankan SQL pemain — jawaban dibandingkan langsung dengan token.
export function evaluateSolution(episodeId, answer) {
  if (typeof answer !== 'string' || answer.trim() === '') {
    throw new QueryError('Jawaban kosong.');
  }
  const def = EPISODE_DEFS.find((d) => d.id === Number(episodeId));
  if (!def) throw new QueryError(`Episode ${episodeId} tidak ditemukan.`);

  const tokens = (def.culprit.tokens ?? [def.culprit.employee_code]).map(norm);
  const answerNorm = norm(answer);
  const correct = tokens.some((tok) => answerNorm === tok || answerNorm.includes(tok));

  return {
    correct,
    rows: [],
    rowCount: 0,
    message: correct
      ? 'Jawaban benar — bukti cukup. Kasus terpecahkan.'
      : 'Jawaban belum benar. Periksa kembali data dan pendekatanmu.',
  };
}

export function isEpisodeSolved(episodeId) {
  const db = openProgressionDb();
  try {
    const row = db
      .prepare('SELECT status FROM progress WHERE episode_id = ?')
      .get(episodeId);
    return row?.status === 'solved';
  } finally {
    db.close();
  }
}

// Bonus efisiensi & akurasi: makin sedikit query valid / salah tebak, makin tinggi skor.
// Hint tidak masuk hitungan. Floor 0, tidak pernah negatif.
export function computeScore(queryCount, wrongAttempts) {
  return Math.max(0, 1000 - 40 * queryCount - 150 * wrongAttempts);
}

// Catat satu tebakan salah pada attempt aktif.
export function recordWrongAttempt(episodeId) {
  const db = openProgressionDb();
  try {
    db.prepare(
      'UPDATE progress SET wrong_attempts = wrong_attempts + 1 WHERE episode_id = ?'
    ).run(episodeId);
  } finally {
    db.close();
  }
}

// Hitung skor saat solve benar + perbarui best_score. Return breakdown/skor.
export function recordSolved(episodeId) {
  const db = openProgressionDb();
  try {
    const row = db
      .prepare('SELECT query_count, wrong_attempts, best_score FROM progress WHERE episode_id = ?')
      .get(episodeId);
    const q = row?.query_count ?? 0;
    const w = row?.wrong_attempts ?? 0;
    const score = computeScore(q, w);
    db.prepare(
      "UPDATE progress SET best_score = MAX(best_score, ?), status = 'solved', solved_at = ? WHERE episode_id = ?"
    ).run(score, new Date().toISOString(), episodeId);
    return { score, breakdown: { queryCount: q, wrongAttempts: w } };
  } finally {
    db.close();
  }
}


export function unlockNext(episodeId) {
  const db = openProgressionDb();
  try {
    const next = Number(episodeId) + 1;
    if (EPISODE_DEFS.some((d) => d.id === next)) {
      db.prepare(
        "UPDATE progress SET status = 'available' WHERE episode_id = ? AND status = 'locked'"
      ).run(next);
    }
  } finally {
    db.close();
  }
}
