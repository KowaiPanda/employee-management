// Compile and server-render routes, and exercise the frontend API adapter.
// These checks do not replace browser interaction or visual verification.
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
}
globalThis.window = { location: { href: '' } }
let passed = 0
const check = (label, condition = true) => {
  assert.ok(condition, label)
  passed++
  console.log(`PASS: ${label}`)
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  const { AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.jsx')
  const render = (route, user) => {
    storage.clear()
    if (user) {
      storage.set('user', JSON.stringify(user))
      storage.set('token', 'test-token')
    }
    return renderToString(createElement(MemoryRouter, { initialEntries: [route] },
      createElement(AuthProvider, null, createElement(App))))
  }
  const admin = { username: 'admin', isAdmin: true }
  const user = { username: 'user', isAdmin: false }
  check('Login route renders username/password form', render('/login').includes('Sign in to continue'))
  for (const route of ['/', '/employees', '/employees/new', '/employees/1', '/employees/1/edit']) {
    check(`Anonymous protected route withholds content: ${route}`, render(route) === '')
  }
  check('Admin dashboard renders', render('/', admin).includes('Dashboard'))
  check('Admin employee directory renders creation action', render('/employees', admin).includes('Add Employee'))
  check('Read-only employee directory hides creation action', !render('/employees', user).includes('Add Employee'))
  const form = render('/employees/new', admin)
  check('Admin creation form renders all required inputs', ['name', 'email', 'phone', 'department', 'designation', 'joining_date', 'status']
    .every((field) => form.includes(`name="${field}"`)))
  check('Joining date field has a maximum date', /type="date" max="\d{4}-\d{2}-\d{2}"/.test(form))
  check('Read-only user blocked from add route', !render('/employees/new', user).includes('Add Employee'))
  check('Read-only user blocked from edit route', !render('/employees/1/edit', user).includes('Edit Employee'))
  check('Admin detail route renders loading state', render('/employees/1', admin).includes('Loading...'))
  check('Admin edit route renders heading', render('/employees/1/edit', admin).includes('Edit Employee'))
  check('Unknown route renders redirect instead of unrelated content', render('/unknown', admin) === '')
  check('Logged-in user is redirected away from login form', !render('/login', admin).includes('Sign in to continue'))

  const { default: ConfirmDialog } = await server.ssrLoadModule('/src/components/ConfirmDialog.jsx')
  const dialog = renderToString(createElement(ConfirmDialog, {
    open: true, title: 'Delete employee', message: 'Confirm test deletion', busy: true,
    onConfirm: () => {}, onCancel: () => {},
  }))
  check('Busy deletion confirmation disables both actions', (dialog.match(/disabled=""/g) ?? []).length === 2
    && dialog.includes('Deleting...'))

  const { api } = await server.ssrLoadModule('/src/api.js')
  const calls = []
  let reply = { status: 200, body: { ok: true } }
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options })
    return new Response(reply.status === 204 ? null : JSON.stringify(reply.body), {
      status: reply.status, headers: { 'Content-Type': 'application/json' },
    })
  }
  try {
    storage.set('token', 'test-token')
    await api.getEmployees({ search: 'QA & Sales', department: '', status: null, page: 2 })
    const query = new URL(calls.at(-1).url, 'http://localhost').searchParams
    check('Frontend encodes search and omits empty filters', query.get('search') === 'QA & Sales'
      && query.get('page') === '2' && !query.has('department') && !query.has('status'))
    check('Frontend attaches token authentication', calls.at(-1).options.headers.Authorization === 'Token test-token')
    for (const [method, invoke, endpoint] of [
      ['POST', () => api.login({ username: 'admin', password: 'test' }), '/api/auth/login/'],
      ['GET', () => api.getEmployee(123), '/api/employees/123/'],
      ['POST', () => api.createEmployee({ name: 'Test' }), '/api/employees/'],
      ['PUT', () => api.updateEmployee(123, { name: 'Updated' }), '/api/employees/123/'],
      ['GET', () => api.getDepartments(), '/api/departments/'],
    ]) {
      await invoke()
      const request = calls.at(-1)
      check(`Frontend API request: ${method} ${endpoint}`, request.url === endpoint
        && (request.options.method ?? 'GET') === method)
    }
    reply = { status: 204 }
    check('Employee deletion accepts empty 204 response', await api.deleteEmployee(123) === null)
    check('Logout accepts empty 204 response', await api.logout() === null)
    reply = { status: 400, body: { email: ['Already exists.'] } }
    await assert.rejects(() => api.createEmployee({}), (error) => error.fields.email[0] === 'Already exists.')
    check('Frontend preserves backend field validation errors')
    reply = { status: 403, body: { detail: 'Permission denied.' } }
    await assert.rejects(() => api.createEmployee({}), { message: 'Permission denied.' })
    check('Frontend exposes permission error message')
    reply = { status: 401, body: { detail: 'Invalid token.' } }
    storage.set('token', 'expired')
    storage.set('user', JSON.stringify(admin))
    await assert.rejects(() => api.getEmployees())
    check('Invalid session clears authentication and redirects to login', !storage.has('token')
      && !storage.has('user') && window.location.href === '/login')
  } finally {
    globalThis.fetch = originalFetch
  }
  console.log(JSON.stringify({ passed, scope: 'Route server-rendering and API adapter; browser interactions not verified' }))
} finally {
  await server.close()
}
