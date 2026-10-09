export default function Loader({ text = 'Loading...' }) {
  return <div role="status" className="flex items-center justify-center gap-2.5 py-12 text-sm text-stone-500"><span className="size-4 animate-spin rounded-full border-2 border-stone-200 border-t-emerald-700" aria-hidden="true" />{text}</div>
}
