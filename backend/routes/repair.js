/**
 * Repair routes – /api/update-repair-status
 */

const express = require('express');
const router = express.Router();
const { updateRepairStatus } = require('../controllers/repairController');
const { writeLimiter } = require('../middleware/rateLimiter');

// PATCH /api/update-repair-status – update a report's repair lifecycle
router.patch('/update-repair-status', writeLimiter, updateRepairStatus);

module.exports = router;
