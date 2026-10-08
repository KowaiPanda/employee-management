import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-slate-100 font-medium' : 'text-slate-600 hover:text-slate-900'}`

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">
          <span className="font-semibold text-indigo-600 mr-4">EMS</span>
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/employees" className={linkClass}>Employees</NavLink>
          <span className="ml-auto text-sm text-slate-500">
            {user.username} ({user.isAdmin ? 'Admin' : 'User'})
          </span>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}
