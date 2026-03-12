const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes       = require('./routes/auth');
const predictionRoutes = require('./routes/prediction');
const adminRoutes      = require('./routes/admin');

const app = express();

// ── CORS — fully open, allow ALL origins ──────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Root route ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    service:   'PlaceAI Backend API',
    status:    'running',
    version:   '1.0.0',
    endpoints: {
      health:     '/api/health',
      auth:       '/api/auth',
      prediction: '/api/prediction',
      admin:      '/api/admin',
    }
  });
});

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    message: 'PlaceAI API is running',
    db:      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ml_url:  process.env.ML_API_URL || 'not set',
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/admin',      adminRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server first, then connect MongoDB ──────────────────
const PORT      = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/placement_db';

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   ML API: ${process.env.ML_API_URL || 'not set'}`);
});

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err.message));
