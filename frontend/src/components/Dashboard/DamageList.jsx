/**
 * DamageList – scrollable list of damage reports in the sidebar.
 *
 * Props:
 *   reports   – array of DamageReport documents
 *   onSelect  – callback(report) when a row is clicked
 *   selected  – currently selected report _id
 *   onStatusChange – callback(id, newStatus) when status is changed
 */
import { severityBadgeBg, statusBadgeBg, toSeverityLabel, formatDate } from '../../utils/helpers';

const STATUS_OPTIONS = ['pending', 'in_progress', 'repaired'];

export default function DamageList({ reports = [], onSelect, selected, onStatusChange }) {
  return (
    <div className="space-y-2">
      {reports.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-8">No damage reports found.</p>
      )}
      {reports.map((r) => {
        const label = toSeverityLabel(r.severity_score);
        const isSelected = selected === r._id;

        return (
          <div
            key={r._id}
            onClick={() => onSelect && onSelect(r)}
            className={`rounded-lg border p-3 cursor-pointer transition-colors ${
              isSelected
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700/50 bg-slate-800/50 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${severityBadgeBg(label)}`}>
                    {label}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">{r.damage_type}</span>
                </div>
                <p className="text-sm font-medium text-white truncate">
                  📍 {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{formatDate(r.timestamp)}</p>
              </div>

              {/* Inline status dropdown */}
              <select
                value={r.repair_status}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusChange && onStatusChange(r._id, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className={`text-xs rounded px-1.5 py-0.5 border cursor-pointer bg-transparent focus:outline-none ${statusBadgeBg(r.repair_status)}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-slate-800 text-slate-100">
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity bar */}
            <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  label === 'critical' ? 'bg-red-500' :
                  label === 'medium'   ? 'bg-orange-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${r.severity_score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
