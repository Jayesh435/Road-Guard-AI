/**
 * RoadGuard AI – Express Server Entry Point
 * Connects to MongoDB, registers all API routes, and starts HTTP server.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Route modules
const damageRoutes = require('./routes/damage');
const repairRoutes = require('./routes/repair');
const mapRoutes = require('./routes/map');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Database ───────────────────────────────────────────────────────────────
connectDB();

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', damageRoutes);   // POST /api/report-damage, GET /api/damages
app.use('/api', repairRoutes);   // PATCH /api/update-repair-status
app.use('/api', mapRoutes);      // GET /api/map-data
app.use('/api', analyticsRoutes);// GET /api/analytics

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'roadguard-backend' }));

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Only listen when this file is run directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 RoadGuard backend running on port ${PORT}`));
}

module.exports = app;
