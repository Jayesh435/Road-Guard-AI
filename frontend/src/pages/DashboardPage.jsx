/**
 * DashboardPage – Main smart city dashboard.
 *
 * Layout:
 *  - Stats bar (KPI cards)
 *  - Filter row
 *  - Map (left) + Damage list (right)
 *  - Analytics charts (bottom)
 *
 * State is fetched from backend on mount and refreshed on filter change.
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

import { getDamages, getMapData, getAnalytics, updateRepairStatus } from '../utils/api';
import StatsCard from '../components/UI/StatsCard';
import SeverityFilter from '../components/Dashboard/SeverityFilter';
import DamageList from '../components/Dashboard/DamageList';
import DamageDetailPanel from '../components/Dashboard/DamageDetailPanel';
import AnalyticsCharts from '../components/Charts/AnalyticsCharts';
import DamageMap from '../components/Map/DamageMap';

export default function DashboardPage() {
  const [filters, setFilters] = useState({ severity: '', damage_type: '', status: '' });
  const [reports, setReports] = useState([]);
  const [mapFeatures, setMapFeatures] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // ── Fetch damage list ──────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDamages(filters);
      setReports(data.data || []);
    } catch {
      toast.error('Failed to load damage reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ── Fetch map data (always unfiltered for map completeness) ───────────
  const fetchMapData = useCallback(async () => {
    try {
      const data = await getMapData();
      setMapFeatures(data.features || []);
    } catch {
      // Map errors are non-critical
    }
  }, []);

  // ── Fetch analytics ────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await getAnalytics();
      setAnalytics(data.data);
    } catch {
      // Analytics errors are non-critical
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchMapData();
    fetchAnalytics();
  }, [fetchReports, fetchMapData, fetchAnalytics]);

  // ── Handle status update ───────────────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    try {
      await updateRepairStatus(id, status);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      // Optimistically update local state
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, repair_status: status } : r))
      );
      if (selected && selected._id === id) {
        setSelected((s) => ({ ...s, repair_status: status }));
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Handle map marker click ────────────────────────────────────────────
  const handleMapSelect = (feature) => {
    const report = reports.find((r) => String(r._id) === String(feature.properties.id));
    if (report) setSelected(report);
  };

  // ── KPI stats ──────────────────────────────────────────────────────────
  const total    = analytics?.severity?.total ?? 0;
  const critical = analytics?.severity?.critical ?? 0;
  const medium   = analytics?.severity?.medium ?? 0;
  const pending  = analytics?.repair_status?.find((s) => s._id === 'pending')?.count ?? 0;
  const repaired = analytics?.repair_status?.find((s) => s._id === 'repaired')?.count ?? 0;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
      {/* ── KPI Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatsCard icon="🗺️" label="Total Reports"   value={total}    color="blue"   loading={analyticsLoading} />
        <StatsCard icon="🔴" label="Critical"        value={critical} color="red"    loading={analyticsLoading} />
        <StatsCard icon="🟠" label="Medium"          value={medium}   color="orange" loading={analyticsLoading} />
        <StatsCard icon="⏳" label="Pending Repair"  value={pending}  color="yellow" loading={analyticsLoading} />
        <StatsCard icon="✅" label="Repaired"        value={repaired} color="green"  loading={analyticsLoading} />
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
        <SeverityFilter filters={filters} onChange={setFilters} />
      </div>

      {/* ── Map + List ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '420px' }}>
        {/* Map */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden" style={{ minHeight: '400px' }}>
          <DamageMap features={mapFeatures} onSelect={handleMapSelect} />
        </div>

        {/* Damage list */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 overflow-y-auto max-h-[500px] custom-scroll">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white text-sm">
              Damage Reports
              {!loading && <span className="ml-2 text-xs text-slate-400">({reports.length})</span>}
            </h2>
            <button
              onClick={() => { fetchReports(); fetchMapData(); fetchAnalytics(); }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              ↺ Refresh
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-700 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <DamageList
              reports={reports}
              onSelect={setSelected}
              selected={selected?._id}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>

      {/* ── Analytics Charts ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-3">📈 Analytics</h2>
        <AnalyticsCharts data={analytics} loading={analyticsLoading} />
      </div>

      {/* ── Detail Panel (slide-in) ────────────────────────────────────── */}
      {selected && (
        <DamageDetailPanel
          report={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
