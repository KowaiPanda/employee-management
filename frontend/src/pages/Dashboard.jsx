import { Link } from 'react-router-dom'
import { api } from '../api'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import Icon from '../components/Icon'
import Loader from '../components/Loader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import { formatDate, initials } from '../utils/format'

// Each paginated list response includes the total `count` of matching employees.
const getStats = async () => {
  const [all, active, inactive, depts] = await Promise.all([
    api.getEmployees({ ordering: '-joining_date' }),
    api.getEmployees({ status: 'active' }),
    api.getEmployees({ status: 'inactive' }),
    api.getDepartments(),
  ])
  return { total: all.count, active: active.count, inactive: inactive.count, departments: depts, recent: all.results.slice(0, 5) }
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useApi(getStats)
  const activePercent = data?.total ? Math.round((data.active / data.total) * 100) : 0

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="page-title">Dashboard</h1><p className="page-description">Employee counts, recent joiners and departments.</p></div>
        <Button to="/employees" variant="secondary">View employees<Icon name="arrow" /></Button>
      </div>
      {loading && <Loader />}
      <ErrorMessage message={error} onRetry={reload} />
      {data && !loading && (
        <div className="space-y-7">
          <div className="panel grid sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total employees" value={data.total} detail="Across the organization" />
            <div className="border-t border-stone-200 sm:border-l sm:border-t-0"><StatCard label="Active employees" value={data.active} detail="Currently on the team" color="text-emerald-700" /></div>
            <div className="border-t border-stone-200 xl:border-l xl:border-t-0"><StatCard label="Inactive employees" value={data.inactive} detail="Retained in your records" color="text-stone-500" /></div>
            <div className="border-t border-stone-200 sm:border-l xl:border-t-0"><StatCard label="Departments" value={data.departments.length} detail="Teams in your workspace" /></div>
          </div>

          <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="panel overflow-hidden" aria-labelledby="recent-title">
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-6 py-5">
                <div><h2 id="recent-title" className="font-semibold">Recently joined</h2><p className="mt-1 text-xs text-stone-500">The latest joining dates in your directory.</p></div>
                <span className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-500">{data.recent.length} employees</span>
              </div>
              <ul className="divide-y divide-stone-100">
                {data.recent.map((emp) => (
                  <li key={emp.id}>
                    <Link to={`/employees/${emp.id}`} className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-stone-50">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">{initials(emp.name)}</span>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{emp.name}</p><p className="mt-1 truncate text-xs text-stone-500">{emp.designation} · {emp.department_name}</p></div>
                      <div className="hidden text-right sm:block"><StatusBadge status={emp.status} /><p className="mt-1.5 text-xs text-stone-500">{formatDate(emp.joining_date)}</p></div>
                      <Icon name="chevron" className="ml-1 size-4 shrink-0 text-stone-500" />
                    </Link>
                  </li>
                ))}
              </ul>
              {data.recent.length === 0 && <p className="px-6 py-12 text-center text-sm text-stone-500">Your employee directory is empty.</p>}
              <Link to="/employees" className="flex items-center justify-center gap-2 border-t border-stone-200 px-6 py-4 text-sm font-medium text-emerald-800 hover:bg-emerald-50">Browse the directory<Icon name="arrow" /></Link>
            </section>

            <div className="space-y-6">
              <section className="panel p-6" aria-labelledby="status-title">
                <h2 id="status-title" className="font-semibold">Employment status</h2>
                <p className="mt-5 text-3xl font-semibold tabular-nums tracking-tight">{activePercent}<span className="ml-0.5 text-lg text-stone-500">%</span></p>
                <p className="mt-1 text-xs text-stone-500">of employees are active</p>
                <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-stone-100" role="img" aria-label={`${data.active} active and ${data.inactive} inactive employees`}>
                  <div className="h-full bg-emerald-600" style={{ width: `${data.total ? (data.active / data.total) * 100 : 0}%` }} />
                  <div className="h-full bg-stone-300" style={{ width: `${data.total ? (data.inactive / data.total) * 100 : 0}%` }} />
                </div>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="flex items-center gap-2 text-stone-500"><span className="size-2 rounded-full bg-emerald-600" />Active</dt><dd className="font-medium tabular-nums">{data.active}</dd></div>
                  <div className="flex justify-between"><dt className="flex items-center gap-2 text-stone-500"><span className="size-2 rounded-full bg-stone-300" />Inactive</dt><dd className="font-medium tabular-nums">{data.inactive}</dd></div>
                </dl>
              </section>
              <section className="panel p-6" aria-labelledby="departments-title">
                <h2 id="departments-title" className="font-semibold">Departments</h2>
                <div className="mt-4 flex flex-wrap gap-2">{data.departments.map((dept) => <span key={dept.id} className="rounded-md border border-stone-200 px-2.5 py-1.5 text-xs text-stone-600">{dept.name}</span>)}</div>
                {data.departments.length === 0 && <p className="mt-4 text-sm text-stone-500">No departments yet.</p>}
              </section>
              {user.isAdmin && <Button to="/employees/new" className="w-full"><Icon name="plus" />Add Employee</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
