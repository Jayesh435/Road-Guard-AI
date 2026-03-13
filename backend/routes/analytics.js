/**
 * Analytics routes – /api/analytics
 */

const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { generalLimiter } = require('../middleware/rateLimiter');

// GET /api/analytics – aggregated stats for the smart city dashboard
router.get('/analytics', generalLimiter, getAnalytics);

module.exports = router;
