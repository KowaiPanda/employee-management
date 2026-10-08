export default function StatusBadge({ status }) {
  const active = status === 'active'
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
