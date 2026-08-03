import express from 'express';
import cors from 'cors';
import { initDatabase } from '../server/db/database.js';
import authRoutes from '../server/routes/authRoutes.js';

const app = express();

try {
  initDatabase();
} catch (e) {
  console.warn('Vercel serverless DB init note:', e.message);
}

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vercel Serverless API active.' });
});

export default app;
