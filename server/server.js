import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { initDatabase } from './db/database.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Initialize SQLite Database and create tables/indexes
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GeoCrop AI Authentication Backend Server is running smoothly.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error.' });
});

// Start Server
app.listen(config.port, () => {
  console.log(`🚀 GeoCrop AI Authentication Backend running on http://localhost:${config.port}`);
});
