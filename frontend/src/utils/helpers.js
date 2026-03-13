/**
 * Severity helpers used across the dashboard.
 */

/** Return Tailwind colour classes for a severity label */
export const severityColor = (label) => {
  switch (label) {
    case 'critical': return 'text-red-400';
    case 'medium':   return 'text-orange-400';
    case 'low':      return 'text-yellow-400';
    default:         return 'text-slate-400';
  }
};

/** Return Tailwind badge bg classes for a severity label */
export const severityBadgeBg = (label) => {
  switch (label) {
    case 'critical': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'medium':   return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    case 'low':      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    default:         return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  }
};

/** Return hex colour for Leaflet circle markers */
export const severityHexColor = (label) => {
  switch (label) {
    case 'critical': return '#ef4444';
    case 'medium':   return '#f97316';
    case 'low':      return '#eab308';
    default:         return '#94a3b8';
  }
};

/** Repair status badge styles */
export const statusBadgeBg = (status) => {
  switch (status) {
    case 'repaired':     return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'in_progress':  return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    default:             return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  }
};

/** Derive severity label from numeric score */
export const toSeverityLabel = (score) => {
  if (score <= 30) return 'low';
  if (score <= 70) return 'medium';
  return 'critical';
};

/** Format ISO timestamp to a readable string */
export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};
