import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'
import Icon from './Icon'

const links = [
  { to: '/', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/employees', label: 'Employees', icon: 'people' },
]

function Brand() {
  return (
    <Link to="/" className="inline-flex items-center gap-3 text-white" aria-label="EMS dashboard">
      <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500 text-slate-950"><Icon name="people" className="size-5" /></span>
      <span className="text-lg font-semibold tracking-tight">EMS<span className="block text-xs font-normal tracking-normal text-slate-400">Employee management</span></span>
    </Link>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const section = pathname.startsWith('/employees') ? 'Employees' : 'Dashboard'

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-slate-950 px-5 py-7 lg:flex">
        <Brand />
        <p className="mb-3 mt-12 px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-500"></p>
        <nav aria-label="Main navigation" className="space-y-1">
          {links.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${isActive ? 'bg-slate-800 font-medium text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <Icon name={icon} className="size-4.5" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-800 pt-5">
          <div className="flex items-center gap-3 px-1">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">{initials(user.username)}</span>
            <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{user.username}</p><p className="mt-0.5 text-xs text-slate-400">{user.isAdmin ? 'Administrator' : 'Read-only access'}</p></div>
          </div>
          <button onClick={logout} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"><Icon name="logout" />Logout</button>
        </div>
      </aside>
      <div className="lg:pl-60">
        <header className="border-b border-stone-200 bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <span className="hidden items-center gap-2 text-xs text-stone-500 lg:flex"><span className="font-medium text-stone-600">{section}</span></span>
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold lg:hidden"><span className="flex size-8 items-center justify-center rounded-lg bg-slate-950 text-white"><Icon name="people" /></span>EMS</Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500">{user.isAdmin ? 'Admin access' : 'Read-only access'}</span>
              <button onClick={logout} className="flex items-center gap-1.5 rounded-md p-2 text-xs text-stone-600 hover:bg-stone-100 lg:hidden"><Icon name="logout" />Logout</button>
            </div>
          </div>
          <nav aria-label="Mobile navigation" className="flex gap-5 px-5 sm:px-8 lg:hidden">
            {links.map(({ to, label, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) =>
              `border-b-2 py-3 text-sm ${isActive ? 'border-emerald-700 font-medium text-emerald-800' : 'border-transparent text-stone-500'}`}>{label}</NavLink>)}
          </nav>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
