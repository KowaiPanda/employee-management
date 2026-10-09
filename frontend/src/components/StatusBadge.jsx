export default function StatusBadge({ status }) {
  const active = status === 'active'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${active ? 'bg-emerald-600' : 'bg-stone-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
