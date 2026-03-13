/**
 * SeverityFilter – filter controls for the map and damage list.
 *
 * Props:
 *   filters   – { severity, damage_type, status }
 *   onChange  – callback({ severity, damage_type, status })
 */
export default function SeverityFilter({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val === filters[key] ? '' : val });

  const severities = [
    { label: 'Critical', value: 'critical', color: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' },
    { label: 'Medium',   value: 'medium',   color: 'bg-orange-500/20 text-orange-400 border-orange-500/40 hover:bg-orange-500/30' },
    { label: 'Low',      value: 'low',      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/30' },
  ];

  const types = ['pothole', 'crack', 'erosion', 'unknown'];
  const statuses = ['pending', 'in_progress', 'repaired'];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Severity */}
      <div className="flex gap-1">
        {severities.map(({ label, value, color }) => (
          <button
            key={value}
            onClick={() => set('severity', value)}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${color} ${
              filters.severity === value ? 'ring-2 ring-offset-1 ring-offset-slate-900' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Damage type */}
      <select
        value={filters.damage_type || ''}
        onChange={(e) => onChange({ ...filters, damage_type: e.target.value })}
        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
      >
        <option value="">All Types</option>
        {types.map((t) => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>

      {/* Repair status */}
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>

      {/* Reset */}
      {(filters.severity || filters.damage_type || filters.status) && (
        <button
          onClick={() => onChange({ severity: '', damage_type: '', status: '' })}
          className="text-xs text-slate-400 hover:text-white underline"
        >
          Reset
        </button>
      )}
    </div>
  );
}
