import { Link } from 'react-router-dom'

const variants = {
  primary: 'border border-emerald-700 bg-emerald-700 text-white hover:border-emerald-800 hover:bg-emerald-800',
  secondary: 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50',
  danger: 'border border-rose-700 bg-rose-700 text-white hover:bg-rose-800',
}

// Renders a <Link> when `to` is given, otherwise a <button>.
export default function Button({ variant = 'primary', className = '', to, ...props }) {
  const cls = `inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`
  return to ? <Link to={to} className={cls} {...props} /> : <button className={cls} {...props} />
}
