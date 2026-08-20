import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { episodeRouter } from './routes/episodes.js';
import { executeRouter } from './routes/execute.js';
import { solveRouter } from './routes/solve.js';
import { hintRouter } from './routes/hints.js';
import { ensureProgressionDb } from './db/progression.js';
import { getEpisodeDefs } from './data/episodes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Hasil build Astro — disajikan backend dalam mode produksi (satu proses, satu port).
const WEB_DIST = path.resolve(__dirname, '../../web/dist');
const IS_PROD = process.env.NODE_ENV === 'production';

const PORT = process.env.PORT || 8787;

// Ensure progression DB + default row exist before accepting requests.
ensureProgressionDb();
const episodeDefs = getEpisodeDefs();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, episodes: episodeDefs.length });
});

app.use('/api/episodes', episodeRouter);
app.use('/api/execute', executeRouter);
app.use('/api/solve', solveRouter);
app.use('/api/hints', hintRouter);

// Produksi: sajikan frontend hasil build dari port yang sama.
if (IS_PROD) {
  app.use(express.static(WEB_DIST));
  // Fallback SPA: rute tanpa file fisik (mis. refresh di /bab/2) tetap dapat index.html.
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(WEB_DIST, 'index.html'));
    }
    next();
  });
}

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Query Noir backend listening on http://localhost:${PORT}`);
});
