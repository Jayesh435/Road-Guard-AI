/**
 * Map routes – /api/map-data
 */

const express = require('express');
const router = express.Router();
const { getMapData } = require('../controllers/mapController');
const { generalLimiter } = require('../middleware/rateLimiter');

// GET /api/map-data – GeoJSON FeatureCollection for the Leaflet map
router.get('/map-data', generalLimiter, getMapData);

module.exports = router;
