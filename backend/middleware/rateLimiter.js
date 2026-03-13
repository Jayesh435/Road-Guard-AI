/**
 * Rate-limiter instances for different API endpoint groups.
 *
 * - generalLimiter  – 100 requests / 15 min per IP (analytics, map-data, damages list)
 * - reportLimiter   – 20  requests / 15 min per IP (damage reporting – file upload path)
 * - writeLimiter    – 50  requests / 15 min per IP (repair status update)
 */

const rateLimit = require('express-rate-limit');

/** General read endpoints */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/** Image upload / report creation */
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many report submissions, please try again later.' },
});

/** Write / mutation endpoints */
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

module.exports = { generalLimiter, reportLimiter, writeLimiter };
