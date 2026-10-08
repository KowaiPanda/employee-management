import { createContext, useContext, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Restore the logged-in user after a page refresh
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')))

  const login = async (creds) => {
    const data = await api.login(creds)
    const next = { username: data.username, isAdmin: data.is_admin }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(next))
    setUser(next)
  }

  const logout = async () => {
    await api.logout().catch(() => {})
    localStorage.clear()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
