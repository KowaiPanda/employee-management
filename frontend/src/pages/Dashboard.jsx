import { api } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import StatCard from '../components/StatCard'
import useApi from '../hooks/useApi'

// Each paginated list response includes the total `count` of matching employees.
const getStats = async () => {
  const [all, active, inactive, depts] = await Promise.all([
    api.getEmployees(),
    api.getEmployees({ status: 'active' }),
    api.getEmployees({ status: 'inactive' }),
    api.getDepartments(),
  ])
  return { total: all.count, active: active.count, inactive: inactive.count, depts: depts.length }
}

export default function Dashboard() {
  const { data, loading, error, reload } = useApi(getStats)

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      {loading && <Loader />}
      <ErrorMessage message={error} onRetry={reload} />
      {data && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Employees" value={data.total} />
          <StatCard label="Active Employees" value={data.active} color="text-green-600" />
          <StatCard label="Inactive Employees" value={data.inactive} color="text-slate-500" />
          <StatCard label="Departments" value={data.depts} color="text-indigo-600" />
        </div>
      )}
    </div>
  )
}
