/**
 * Repair controller – handles status updates for damage reports.
 *
 * updateRepairStatus – PATCH /api/update-repair-status
 */

const DamageReport = require('../models/DamageReport');

const VALID_STATUSES = ['pending', 'in_progress', 'repaired'];

/**
 * PATCH /api/update-repair-status
 * Body (JSON):
 *   id     – MongoDB ObjectId of the DamageReport
 *   status – pending | in_progress | repaired
 */
const updateRepairStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'id and status are required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const report = await DamageReport.findByIdAndUpdate(
      id,
      { repair_status: status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Damage report not found' });
    }

    res.json({ success: true, data: report });
  } catch (err) {
    console.error('updateRepairStatus error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { updateRepairStatus };
