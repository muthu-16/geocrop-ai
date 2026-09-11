import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { initDatabase } from './db/database.js';
import authRoutes from './routes/authRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import { applySecurityMiddleware } from './middleware/security.js';

const app = express();

// Initialize SQLite Database and create tables/indexes
initDatabase();

// Apply Helmet, HPP & Input Sanitization Security Suite
applySecurityMiddleware(app);

// Enable CORS and Payload Size Limiting (Max 100kb payload to prevent DoS)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', geminiRoutes);

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
