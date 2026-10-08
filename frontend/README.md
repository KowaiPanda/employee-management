# Employee Management Dashboard

React app for viewing and managing employees. It uses the Django API in `../backend`.

**Stack:** React 19, Vite, React Router, Tailwind CSS.

## Running

The backend must be running on `http://localhost:8000` (see [../backend/README.md](../backend/README.md)).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Log in as `admin` / `admin123` (full access) or `user` / `user123` (read only).

## Pages and routes

```
/login                 Login
/                      Dashboard
/employees             Employee List
/employees/new         Add Employee       (admin only)
/employees/:id         Employee Details
/employees/:id/edit    Edit Employee      (admin only)
```

Every route except `/login` requires login. Unknown URLs redirect to the dashboard.

## Project structure

```
src/
├── main.jsx              Entry point: wraps the app in BrowserRouter and AuthProvider
├── App.jsx               Route definitions
├── api.js                All HTTP calls to the backend
├── index.css             Tailwind import
├── context/
│   └── AuthContext.jsx   Logged-in user, login() and logout()
├── hooks/
│   ├── useApi.js         Runs an API call; tracks data / loading / error
│   └── useDebounce.js    Delays search input before it triggers a request
├── components/           Reusable building blocks
│   ├── Layout.jsx        Top navbar + page container
│   ├── ProtectedRoute.jsx
│   ├── EmployeeForm.jsx  Form shared by Add and Edit
│   ├── Field.jsx         Label + input/select + error text
│   ├── Button.jsx
│   ├── ConfirmDialog.jsx
│   ├── StatCard.jsx
│   ├── StatusBadge.jsx
│   ├── Loader.jsx
│   └── ErrorMessage.jsx
└── pages/                One component per route
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── EmployeeList.jsx
    ├── AddEmployee.jsx
    ├── EditEmployee.jsx
    └── EmployeeDetails.jsx
```

**`pages/`** components map to routes and own the page's state. **`components/`** are small and reusable; they get everything through props. **`hooks/`** hold reusable logic, and **`api.js`** is the only file that knows about URLs and HTTP.

## Important components

**`AuthContext`**: stores the current user (`{ username, isAdmin }`) in React context so any component can call `useAuth()`. `login()` posts the credentials, then saves the token and user to `localStorage` so a refresh keeps you logged in. `logout()` calls the API and clears storage.

**`ProtectedRoute`**: a layout route that renders `<Outlet />` only when someone is logged in, otherwise it redirects to `/login`. With the `adminOnly` prop it also sends normal users away from the Add and Edit pages.

**`useApi(fn, deps)`**: a custom hook used by every page that loads data. It calls `fn()` whenever `deps` change and returns `{ data, loading, error, reload }`. It ignores responses from outdated requests, so quickly typing in the search box never shows stale results.

**`EmployeeList`**: keeps search, department, status and page in state. The search text goes through `useDebounce` (400 ms), and all four values are passed to `useApi` as dependencies, so any change refetches the list from the server. Filtering, search and pagination all happen on the backend. The Edit and Delete buttons render only for admins. Delete opens a `ConfirmDialog` first.

**`EmployeeForm`**: a controlled form (one `form` state object) shared by Add and Edit. The parent page passes `initial` values and an `onSubmit` function, so the form doesn't know whether it is creating or updating. It validates on the client before submitting (required fields, email format, phone digits, no future joining date). If the server still rejects the data (for example, a duplicate email), its field errors appear under the matching inputs.

**`EmployeeDetails`**: reads `:id` with `useParams`, loads the employee, and shows every field, including created and updated times.

**`Dashboard`**: loads four summary numbers in parallel with `Promise.all` and renders them with `StatCard`.

**`Field`, `Button`, `StatusBadge`, `Loader`, `ErrorMessage`, `ConfirmDialog`**: small presentational components reused across pages so the styling stays in one place.

## API integration

A backend API was available, so the app calls it directly instead of starting with mock JSON.

**Proxy:** `vite.config.js` forwards every `/api/*` request from the dev server to `http://localhost:8000`, so the browser sees one origin and no CORS setup is needed.

**`api.js`**: one `request()` helper wraps `fetch`. It:

- adds `Content-Type: application/json` and `Authorization: Token <token>` (from `localStorage`)
- returns parsed JSON, or `null` for `204 No Content`
- throws an `Error` for non-2xx responses, with the backend's `detail` message as `err.message` and the full error body as `err.fields` (used for field errors in forms)
- on `401` with a stored token (expired or invalid), clears storage and redirects to `/login`

Pages call named functions instead of building URLs themselves:

| Function | Request |
|---|---|
| `login(creds)` | `POST /api/auth/login/` |
| `logout()` | `POST /api/auth/logout/` |
| `getEmployees(params)` | `GET /api/employees/?search=&department=&status=&page=` |
| `getEmployee(id)` | `GET /api/employees/:id/` |
| `createEmployee(data)` | `POST /api/employees/` |
| `updateEmployee(id, data)` | `PUT /api/employees/:id/` |
| `deleteEmployee(id)` | `DELETE /api/employees/:id/` |
| `getDepartments()` | `GET /api/departments/` |

**Loading and errors:** each page reads `loading` and `error` from `useApi`, shows `<Loader />` while waiting, and shows `<ErrorMessage />` (with a Retry button where useful) on failure. Buttons show "Saving..." or "Deleting..." and are disabled while a request is running.

## Concepts covered

| Concept | Where |
|---|---|
| Components and props | `components/*`, e.g. `StatCard`, `Field`, `EmployeeForm` |
| State | `useState` in every page and form |
| Hooks | `useState`, `useEffect`, `useContext`, custom `useApi` and `useDebounce` |
| Forms and validation | `EmployeeForm`, `Login` |
| Conditional rendering | Admin-only buttons, loading/error/empty states, `ConfirmDialog` |
| Lists | Employee table rows, department options |
| Routing | `App.jsx`, `ProtectedRoute`, `useParams`, `useNavigate` |
| API integration and CRUD | `api.js`, used by every page |
| Loading states and error handling | `useApi`, `Loader`, `ErrorMessage` |
| Reusable components | `Button`, `Field`, `ConfirmDialog`, `EmployeeForm` |
