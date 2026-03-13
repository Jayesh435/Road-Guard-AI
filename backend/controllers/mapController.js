/**
 * Map controller – returns geo-encoded damage data for the Leaflet map view.
 *
 * getMapData – GET /api/map-data
 * Returns lightweight GeoJSON-compatible features for every damage report.
 */

const DamageReport = require('../models/DamageReport');

/**
 * GET /api/map-data
 * Returns all damage reports as a GeoJSON FeatureCollection.
 * Each feature includes severity_label, damage_type, repair_status and priority_score.
 */
const getMapData = async (_req, res) => {
  try {
    const reports = await DamageReport.find({}, {
      latitude: 1,
      longitude: 1,
      damage_type: 1,
      severity_score: 1,
      repair_status: 1,
      priority_score: 1,
      timestamp: 1,
      image_url: 1,
      description: 1,
    });

    const features = reports.map((r) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.longitude, r.latitude], // GeoJSON: [lng, lat]
      },
      properties: {
        id: r._id,
        damage_type: r.damage_type,
        severity_score: r.severity_score,
        severity_label: r.severity_label, // virtual
        repair_status: r.repair_status,
        priority_score: r.priority_score,
        timestamp: r.timestamp,
        image_url: r.image_url,
        description: r.description,
      },
    }));

    res.json({
      success: true,
      type: 'FeatureCollection',
      features,
    });
  } catch (err) {
    console.error('getMapData error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMapData };
