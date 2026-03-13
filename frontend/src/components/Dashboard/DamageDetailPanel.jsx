/**
 * DamageDetailPanel – expanded details panel shown when a damage report is selected.
 *
 * Props:
 *   report        – selected DamageReport document
 *   onClose       – callback to close the panel
 *   onStatusChange – callback(id, status)
 */
import { severityBadgeBg, statusBadgeBg, toSeverityLabel, formatDate } from '../../utils/helpers';

const STATUS_OPTIONS = ['pending', 'in_progress', 'repaired'];

export default function DamageDetailPanel({ report, onClose, onStatusChange }) {
  if (!report) return null;
  const label = report.severity_label || toSeverityLabel(report.severity_score);

  return (
    <div className="fixed inset-y-0 right-0 top-16 w-full max-w-sm bg-slate-900 border-l border-slate-700 shadow-2xl z-40 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="font-semibold text-white">Damage Details</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
      </div>

      {/* Image */}
      {report.image_url && (
        <div className="relative">
          <img
            src={report.image_url}
            alt="Road damage"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.src = 'https://placehold.co/400x200/1e293b/94a3b8?text=No+Image'; }}
          />
          <div className="absolute bottom-2 left-2">
            <span className={`text-xs px-2 py-1 rounded-full ${severityBadgeBg(label)}`}>
              {label.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="p-4 space-y-4 flex-1">
        {/* Type & confidence */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400">Damage Type</p>
            <p className="text-sm font-medium text-white capitalize mt-1">{report.damage_type}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400">AI Confidence</p>
            <p className="text-sm font-medium text-white mt-1">
              {report.ai_confidence ? `${(report.ai_confidence * 100).toFixed(1)}%` : '—'}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400">Severity Score</p>
            <p className="text-sm font-medium text-white mt-1">{report.severity_score} / 100</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400">Priority Score</p>
            <p className="text-sm font-medium text-white mt-1">{report.priority_score ?? '—'}</p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">📍 Location</p>
          <p className="text-sm text-white">
            {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
          </p>
        </div>

        {/* Description */}
        {report.description && (
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Description</p>
            <p className="text-sm text-slate-300">{report.description}</p>
          </div>
        )}

        {/* Reported by & timestamp */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400">Reported by</p>
            <p className="text-sm text-white mt-1">{report.reported_by || 'anonymous'}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400">Date</p>
            <p className="text-xs text-white mt-1">{formatDate(report.timestamp)}</p>
          </div>
        </div>

        {/* Repair status updater */}
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-2">Update Repair Status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange && onStatusChange(report._id, s)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all capitalize ${
                  report.repair_status === s
                    ? statusBadgeBg(s)
                    : 'border-slate-600 text-slate-400 hover:border-slate-400'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
