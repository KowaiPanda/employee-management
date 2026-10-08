// All backend calls go through here. Vite proxies /api to Django (see vite.config.js).
const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    },
  })

  // Expired or invalid token: clear the session and go back to login
  if (res.status === 401 && token) {
    localStorage.clear()
    window.location.href = '/login'
  }
  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.detail || `Request failed (${res.status})`)
    err.fields = data // field errors, e.g. { email: ['Enter a valid email address.'] }
    throw err
  }
  return data
}

// Drop empty values so we don't send ?search=&status=
const query = (params) =>
  new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))

const send = (method, body) => ({ method, body: JSON.stringify(body) })

export const api = {
  login: (creds) => request('/auth/login/', send('POST', creds)),
  logout: () => request('/auth/logout/', { method: 'POST' }),

  getEmployees: (params = {}) => request(`/employees/?${query(params)}`),
  getEmployee: (id) => request(`/employees/${id}/`),
  createEmployee: (data) => request('/employees/', send('POST', data)),
  updateEmployee: (id, data) => request(`/employees/${id}/`, send('PUT', data)),
  deleteEmployee: (id) => request(`/employees/${id}/`, { method: 'DELETE' }),

  getDepartments: () => request('/departments/'),
}
