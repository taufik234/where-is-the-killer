import express from 'express';
import cors from 'cors';
import { episodeRouter } from './routes/episodes.js';
import { executeRouter } from './routes/execute.js';
import { solveRouter } from './routes/solve.js';
import { hintRouter } from './routes/hints.js';
import { ensureProgressionDb } from './db/progression.js';
import { getEpisodeDefs } from './data/episodes/index.js';

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
