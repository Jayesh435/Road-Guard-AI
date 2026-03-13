/**
 * Centralised API utility.
 * All fetch calls target VITE_API_BASE_URL (defaults to http://localhost:5000/api).
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Report a road damage (multipart/form-data with image + GPS).
 * @param {FormData} formData
 */
export const reportDamage = async (formData) => {
  const res = await fetch(`${BASE_URL}/report-damage`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to report damage');
  return res.json();
};

/**
 * Fetch all damage reports with optional query filters.
 * @param {Object} params – { severity, damage_type, status, limit, page }
 */
export const getDamages = async (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  const res = await fetch(`${BASE_URL}/damages${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch damages');
  return res.json();
};

/**
 * Fetch GeoJSON map data.
 */
export const getMapData = async () => {
  const res = await fetch(`${BASE_URL}/map-data`);
  if (!res.ok) throw new Error('Failed to fetch map data');
  return res.json();
};

/**
 * Update repair status for a damage report.
 * @param {string} id     – MongoDB ObjectId
 * @param {string} status – pending | in_progress | repaired
 */
export const updateRepairStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/update-repair-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error('Failed to update repair status');
  return res.json();
};

/**
 * Fetch analytics data.
 */
export const getAnalytics = async () => {
  const res = await fetch(`${BASE_URL}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};
