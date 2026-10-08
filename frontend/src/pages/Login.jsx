import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import Field from '../components/Field'
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Employee Management</h1>
          <p className="text-sm text-slate-500">Sign in to continue</p>
        </div>
        <ErrorMessage message={error} />
        <Field label="Username" name="username" value={form.username} onChange={handleChange} autoFocus />
        <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
        <Button type="submit" disabled={loading} className="w-full py-2">
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
