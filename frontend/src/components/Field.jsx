import { useId } from 'react'

export default function Field({ label, error, hint, as = 'input', children, className = '', ...props }) {
  const id = useId()
  const Tag = as
  const control = {
    ...props,
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || hint ? `${id}-description` : undefined,
    className: `control ${error ? 'border-rose-400' : ''}`,
  }
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-stone-700">{label}</label>
      {as === 'input' ? <input {...control} /> : <Tag {...control}>{children}</Tag>}
      {(error || hint) && <p id={`${id}-description`} className={`mt-1.5 text-xs leading-5 ${error ? 'text-rose-700' : 'text-stone-500'}`}>{error || hint}</p>}
    </div>
  )
}
