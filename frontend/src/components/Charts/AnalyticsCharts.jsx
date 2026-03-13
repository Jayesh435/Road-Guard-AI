/**
 * AnalyticsCharts – Recharts-based analytics section of the dashboard.
 *
 * Shows:
 *  1. Severity distribution (PieChart)
 *  2. Daily reports (BarChart)
 *  3. Damage type breakdown (PieChart)
 *  4. Repair status (PieChart)
 *
 * Props:
 *   data    – analytics response from /api/analytics
 *   loading – boolean
 */
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';

const SEVERITY_COLORS = ['#eab308', '#f97316', '#ef4444'];
const TYPE_COLORS     = ['#3b82f6', '#8b5cf6', '#10b981', '#94a3b8'];
const STATUS_COLORS   = ['#94a3b8', '#3b82f6', '#10b981'];

export default function AnalyticsCharts({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-800 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { severity, damage_types = [], repair_status = [], daily_reports = [] } = data;

  const severityData = [
    { name: 'Low',      value: severity?.low ?? 0 },
    { name: 'Medium',   value: severity?.medium ?? 0 },
    { name: 'Critical', value: severity?.critical ?? 0 },
  ];

  const typeData = damage_types.map((t) => ({
    name: t._id?.charAt(0).toUpperCase() + t._id?.slice(1) || 'Unknown',
    value: t.count,
  }));

  const statusData = repair_status.map((s) => ({
    name: s._id?.replace('_', ' '),
    value: s.count,
  }));

  const dailyData = daily_reports.map((d) => ({
    date: d._id?.slice(5) || d._id, // MM-DD
    reports: d.count,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Severity distribution */}
      <ChartCard title="Severity Distribution">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={severityData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
              {severityData.map((_, i) => <Cell key={i} fill={SEVERITY_COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} contentStyle={tooltipStyle} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Daily reports */}
      <ChartCard title="Reports (Last 7 Days)">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="reports" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Damage type breakdown */}
      <ChartCard title="Damage Types">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
              {typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Repair status */}
      <ChartCard title="Repair Status">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
              {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
      <h3 className="text-xs font-medium text-slate-400 mb-2">{title}</h3>
      {children}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: '#1e293b',
  borderColor: '#334155',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '11px',
};
