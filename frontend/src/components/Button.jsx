import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

// Renders a <Link> when `to` is given, otherwise a <button>.
export default function Button({ variant = 'primary', className = '', to, ...props }) {
  const cls = `inline-block px-3 py-1.5 rounded-md text-sm disabled:opacity-50 ${variants[variant]} ${className}`
  return to ? <Link to={to} className={cls} {...props} /> : <button className={cls} {...props} />
}
