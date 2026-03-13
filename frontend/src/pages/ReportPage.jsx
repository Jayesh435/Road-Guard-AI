/**
 * ReportPage – citizen damage reporting page.
 * Wraps the ReportForm component and shows a success confirmation.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReportForm from '../components/Report/ReportForm';

export default function ReportPage() {
  const [lastReport, setLastReport] = useState(null);

  const handleSuccess = (result) => {
    setLastReport(result.data);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="text-5xl mb-3">🚨</div>
        <h1 className="text-2xl font-bold text-white">Report Road Damage</h1>
        <p className="text-slate-400 text-sm mt-2">
          Help your municipality fix roads faster. Upload a photo and GPS location
          and our AI will analyse the damage automatically.
        </p>
      </div>

      {/* Last submitted report summary */}
      {lastReport && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
          <p className="text-green-400 font-semibold text-sm mb-2">✅ Report submitted!</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div>
              <span className="text-slate-500">Damage type: </span>
              <span className="capitalize">{lastReport.damage_type}</span>
            </div>
            <div>
              <span className="text-slate-500">Severity: </span>
              <span>{lastReport.severity_score} / 100</span>
            </div>
            <div>
              <span className="text-slate-500">Priority: </span>
              <span>{lastReport.priority_score}</span>
            </div>
            <div>
              <span className="text-slate-500">Status: </span>
              <span>{lastReport.repair_status}</span>
            </div>
          </div>
          <Link
            to="/"
            className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300 underline"
          >
            View on dashboard →
          </Link>
        </div>
      )}

      {/* Form */}
      <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-6">
        <ReportForm onSuccess={handleSuccess} />
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl text-xs text-slate-400 space-y-1">
        <p>🤖 <strong className="text-slate-300">AI powered</strong> – YOLOv8 detects potholes, cracks & erosion automatically.</p>
        <p>📍 <strong className="text-slate-300">Geotagged</strong> – GPS coordinates pinpoint the exact damage location on the map.</p>
        <p>⚡ <strong className="text-slate-300">Smart priority</strong> – reports are ranked by severity, traffic & citizen votes.</p>
      </div>
    </div>
  );
}
