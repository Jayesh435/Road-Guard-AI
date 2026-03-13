/**
 * StatsCard – displays a single KPI metric on the dashboard.
 */
export default function StatsCard({ icon, label, value, color = 'blue', loading }) {
  const colorMap = {
    blue:   'from-blue-600/20 to-blue-800/10 border-blue-700/30 text-blue-400',
    red:    'from-red-600/20  to-red-800/10  border-red-700/30  text-red-400',
    orange: 'from-orange-600/20 to-orange-800/10 border-orange-700/30 text-orange-400',
    yellow: 'from-yellow-600/20 to-yellow-800/10 border-yellow-700/30 text-yellow-400',
    green:  'from-green-600/20 to-green-800/10 border-green-700/30 text-green-400',
  };
  const cls = colorMap[color] || colorMap.blue;

  return (
    <div className={`rounded-xl bg-gradient-to-br border p-4 ${cls}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {loading ? (
          <div className="h-8 w-16 bg-slate-700 animate-pulse rounded" />
        ) : (
          <span className="text-3xl font-bold text-white">{value ?? 0}</span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}
