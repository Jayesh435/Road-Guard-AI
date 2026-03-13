/**
 * Damage routes – /api/report-damage and /api/damages
 */

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { reportDamage, getDamages } = require('../controllers/damageController');
const { reportLimiter, generalLimiter } = require('../middleware/rateLimiter');

// POST /api/report-damage – upload image + GPS, run AI inference, save report
router.post('/report-damage', reportLimiter, upload.single('image'), reportDamage);

// GET /api/damages – list all damage reports (with optional query filters)
router.get('/damages', generalLimiter, getDamages);

module.exports = router;
