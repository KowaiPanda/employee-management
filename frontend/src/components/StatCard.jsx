export default function StatCard({ label, value, detail, color = 'text-stone-900' }) {
  return (
    <div className="px-6 py-6">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-3 text-4xl font-semibold tabular-nums tracking-tight ${color}`}>{value}</p>
      <p className="mt-3 text-xs text-stone-500">{detail}</p>
    </div>
  )
}
