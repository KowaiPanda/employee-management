// Label + input/select + error message. Extra props go to the input.
export default function Field({ label, error, as = 'input', children, ...props }) {
  const Tag = as
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <Tag
        className={`w-full rounded-md border px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500 ${error ? 'border-red-500' : 'border-slate-300'}`}
        {...props}
      >
        {children}
      </Tag>
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  )
}
