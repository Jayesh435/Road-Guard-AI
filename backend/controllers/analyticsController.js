/**
 * Analytics controller – aggregated statistics for the dashboard.
 *
 * getAnalytics – GET /api/analytics
 * Returns counts by severity, damage type, repair status, and time-series.
 */

const DamageReport = require('../models/DamageReport');

const getAnalytics = async (_req, res) => {
  try {
    // Severity distribution
    const [low, medium, critical] = await Promise.all([
      DamageReport.countDocuments({ severity_score: { $lte: 30 } }),
      DamageReport.countDocuments({ severity_score: { $gt: 30, $lte: 70 } }),
      DamageReport.countDocuments({ severity_score: { $gt: 70 } }),
    ]);

    // Damage type breakdown
    const typeBreakdown = await DamageReport.aggregate([
      { $group: { _id: '$damage_type', count: { $sum: 1 } } },
    ]);

    // Repair status counts
    const statusBreakdown = await DamageReport.aggregate([
      { $group: { _id: '$repair_status', count: { $sum: 1 } } },
    ]);

    // Last 7 days – daily report counts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyReports = await DamageReport.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 5 high-priority unrepaired segments
    const topPriority = await DamageReport.find({ repair_status: { $ne: 'repaired' } })
      .sort({ priority_score: -1 })
      .limit(5)
      .select('latitude longitude damage_type severity_score priority_score repair_status');

    res.json({
      success: true,
      data: {
        severity: { low, medium, critical, total: low + medium + critical },
        damage_types: typeBreakdown,
        repair_status: statusBreakdown,
        daily_reports: dailyReports,
        top_priority: topPriority,
      },
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAnalytics };
