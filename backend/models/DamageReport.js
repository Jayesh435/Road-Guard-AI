/**
 * Mongoose model for a road damage report.
 *
 * Fields:
 *  image_url      – Publicly accessible URL of the uploaded damage photo
 *  damage_type    – Detected damage category (pothole | crack | erosion)
 *  severity_score – 0-100 composite severity (low/medium/critical)
 *  latitude       – GPS latitude supplied by the reporter
 *  longitude      – GPS longitude supplied by the reporter
 *  description    – Optional free-text description from the citizen
 *  reported_by    – Name / identifier of the submitter
 *  repair_status  – Lifecycle state of the repair
 *  ai_confidence  – Model confidence score (0-1) from YOLO inference
 *  bounding_box   – YOLO bounding box [x, y, width, height] in pixels
 *  traffic_density– 0-100 score representing road traffic at this location
 *  citizen_reports– Number of times citizens have reported this segment
 *  priority_score – Computed smart priority for repair queue
 *  timestamp      – Auto-set creation date
 */

const mongoose = require('mongoose');

const damageReportSchema = new mongoose.Schema(
  {
    image_url: {
      type: String,
      required: [true, 'image_url is required'],
    },
    damage_type: {
      type: String,
      enum: ['pothole', 'crack', 'erosion', 'unknown'],
      default: 'unknown',
    },
    severity_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    latitude: {
      type: Number,
      required: [true, 'latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'longitude is required'],
    },
    description: {
      type: String,
      default: '',
    },
    reported_by: {
      type: String,
      default: 'anonymous',
    },
    repair_status: {
      type: String,
      enum: ['pending', 'in_progress', 'repaired'],
      default: 'pending',
    },
    ai_confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    bounding_box: {
      type: [Number], // [x, y, width, height]
      default: [],
    },
    traffic_density: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    citizen_reports: {
      type: Number,
      default: 1,
    },
    priority_score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: 'updatedAt' },
  }
);

// Virtual: derive severity label from score
damageReportSchema.virtual('severity_label').get(function () {
  if (this.severity_score <= 30) return 'low';
  if (this.severity_score <= 70) return 'medium';
  return 'critical';
});

// Ensure virtuals are included when converting to JSON
damageReportSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('DamageReport', damageReportSchema);
