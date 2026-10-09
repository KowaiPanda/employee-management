import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import Field from '../components/Field'
import Icon from '../components/Icon'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return setError('Username and password are required')
    setLoading(true)
    setError('')
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <aside className="hidden flex-col justify-between bg-slate-950 p-10 text-white md:flex lg:p-16">
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500 text-slate-950"><Icon name="people" className="size-5" /></span><span className="text-xl font-semibold tracking-tight">EMS</span></div>
        <div className="py-20">
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight lg:text-5xl">Employee<br />Management</h1>
          <div className="mt-10 h-1 w-12 bg-emerald-500" />
        </div>
        <p className="text-xs text-slate-500"></p>
      </aside>
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-12 flex items-center gap-2 text-sm font-semibold md:hidden"><span className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-white"><Icon name="people" /></span>Employee Management</div>
          <div className="mb-8">
            <p className="mb-2 text-sm text-stone-500">Welcome back</p>
            <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorMessage message={error} />
            <Field label="Username" name="username" value={form.username} onChange={handleChange} autoComplete="username" autoFocus />
            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Signing in...' : 'Sign in'}<Icon name="arrow" />
            </Button>
          </form>
          <p className="mt-8 border-t border-stone-200 pt-5 text-xs leading-6 text-stone-500">Access is managed by your administrator.</p>
        </div>
      </main>
    </div>
  )
}
