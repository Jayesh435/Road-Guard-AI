/**
 * Damage controller – business logic for reporting and retrieving road damage.
 *
 * reportDamage  – Accepts image + GPS, calls AI service, persists the report.
 * getDamages    – Returns all reports with optional filters.
 */

const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const DamageReport = require('../models/DamageReport');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Compute the smart priority score.
 *  Priority = severity×0.5 + traffic_density×0.3 + citizen_reports_normalized×0.2
 */
const computePriority = (severity, trafficDensity, citizenReports) => {
  // Normalise citizen reports to a 0-100 scale (cap at 50 reports)
  const normReports = Math.min(citizenReports, 50) * 2;
  return Math.round(severity * 0.5 + trafficDensity * 0.3 + normReports * 0.2);
};

/**
 * POST /api/report-damage
 * Body (multipart/form-data):
 *   image      – road damage photo
 *   latitude   – GPS latitude
 *   longitude  – GPS longitude
 *   description – optional text
 *   reported_by – optional name
 *   traffic_density – optional 0-100 score (defaults to 50)
 */
const reportDamage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { latitude, longitude, description = '', reported_by = 'anonymous', traffic_density = 50 } =
      req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    // Build the public URL for the saved image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const imagePath = req.file.path;

    // ── Call AI service for inference ────────────────────────────────────
    let aiResult = { damage_type: 'unknown', confidence: 0, bounding_box: [], severity_score: 0 };

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(imagePath), req.file.originalname);

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/detect`, form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });
      aiResult = aiResponse.data;
    } catch (aiErr) {
      // AI service is optional – continue without it and flag damage_type as unknown
      console.warn('⚠️  AI service unavailable:', aiErr.message);
    }

    const trafficDensityNum = Number(traffic_density);

    // Derive citizen_reports count (1 for the first report; more via PATCH)
    const existingCount = await DamageReport.countDocuments({
      latitude: { $gte: Number(latitude) - 0.001, $lte: Number(latitude) + 0.001 },
      longitude: { $gte: Number(longitude) - 0.001, $lte: Number(longitude) + 0.001 },
    });
    const citizenReports = existingCount + 1;

    const priorityScore = computePriority(
      aiResult.severity_score || 0,
      trafficDensityNum,
      citizenReports
    );

    const report = await DamageReport.create({
      image_url: imageUrl,
      damage_type: aiResult.damage_type || 'unknown',
      severity_score: aiResult.severity_score || 0,
      ai_confidence: aiResult.confidence || 0,
      bounding_box: aiResult.bounding_box || [],
      latitude: Number(latitude),
      longitude: Number(longitude),
      description,
      reported_by,
      traffic_density: trafficDensityNum,
      citizen_reports: citizenReports,
      priority_score: priorityScore,
    });

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    console.error('reportDamage error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/damages
 * Query params (all optional):
 *   severity   – low | medium | critical
 *   damage_type – pothole | crack | erosion | unknown
 *   status     – pending | in_progress | repaired
 *   limit      – max number of results (default 100)
 *   page       – page number (default 1)
 */
const getDamages = async (req, res) => {
  try {
    const { severity, damage_type, status, limit = 100, page = 1 } = req.query;

    const filter = {};

    if (damage_type) filter.damage_type = damage_type;
    if (status) filter.repair_status = status;

    if (severity === 'low') {
      filter.severity_score = { $gte: 0, $lte: 30 };
    } else if (severity === 'medium') {
      filter.severity_score = { $gt: 30, $lte: 70 };
    } else if (severity === 'critical') {
      filter.severity_score = { $gt: 70 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      DamageReport.find(filter)
        .sort({ priority_score: -1, timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DamageReport.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: reports,
    });
  } catch (err) {
    console.error('getDamages error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { reportDamage, getDamages };
