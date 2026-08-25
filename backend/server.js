import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './database/db.js';
import { query } from './database/db.js';

import authRoutes from './routes/authRoutes.js';
import travelRoutes from './routes/travelRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import pexelsRoutes from './routes/pexelsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database on Startup
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server due to database error:", err.message);
    process.exit(1);
  });

// ==========================================
// API ROUTES MOUNTING
// ==========================================

// Health Check Endpoint
app.get('/api/health', async (req, res, next) => {
  try {
    const dbCheck = await query('SELECT 1');
    if (dbCheck.rows.length > 0) {
      return res.status(200).json({
        success: true,
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    }
    throw new Error('Database ping failed');
  } catch (error) {
    next(error);
  }
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/pexels', pexelsRoutes);

// ==========================================
// ERROR HANDLER MIDDLEWARE
// ==========================================

app.use((err, req, res, next) => {
  console.error("Express Error Handler Captured:", err);
  
  // Handle PostgreSQL specific constraints
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Conflict: Unique constraint violation (e.g. duplicate email)'
    });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Foreign key constraint violation: referenced ID does not exist'
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
