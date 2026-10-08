import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import useDebounce from '../hooks/useDebounce'

const PAGE_SIZE = 10 // matches PAGE_SIZE in Django settings
const inputClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm bg-white'

export default function EmployeeList() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [target, setTarget] = useState(null) // employee pending delete
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const term = useDebounce(search)
  const depts = useApi(api.getDepartments)
  const emps = useApi(
    () => api.getEmployees({ search: term, department: dept, status, page }),
    [term, dept, status, page],
  )

  // Any filter change goes back to the first page
  const onFilter = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteEmployee(target.id)
      // If we removed the last row on this page, step back a page
      if (emps.data.results.length === 1 && page > 1) setPage(page - 1)
      else emps.reload()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
      setTarget(null)
    }
  }

  const rows = emps.data?.results ?? []
  const pages = Math.max(1, Math.ceil((emps.data?.count ?? 0) / PAGE_SIZE))

  return (
    <div>
      <div className="flex items-center mb-4">
        <h1 className="text-xl font-semibold">Employees</h1>
        {user.isAdmin && (
          <Button to="/employees/new" className="ml-auto">+ Add Employee</Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className={`${inputClass} flex-1 min-w-48`}
          placeholder="Search name, email, phone, designation..."
          value={search}
          onChange={onFilter(setSearch)}
        />
        <select className={inputClass} value={dept} onChange={onFilter(setDept)}>
          <option value="">All departments</option>
          {depts.data?.map((d) => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>
        <select className={inputClass} value={status} onChange={onFilter(setStatus)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <ErrorMessage message={emps.error} onRetry={emps.reload} />
      <ErrorMessage message={deleteError} />

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {['ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Joining Date', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((emp) => (
              <tr key={emp.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{emp.id}</td>
                <td className="px-4 py-3 font-medium">{emp.name}</td>
                <td className="px-4 py-3">{emp.email}</td>
                <td className="px-4 py-3">{emp.phone}</td>
                <td className="px-4 py-3">{emp.department_name}</td>
                <td className="px-4 py-3">{emp.designation}</td>
                <td className="px-4 py-3">{emp.joining_date}</td>
                <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap space-x-3 text-right">
                  <Link to={`/employees/${emp.id}`} className="text-indigo-600 hover:underline">View</Link>
                  {user.isAdmin && (
                    <>
                      <Link to={`/employees/${emp.id}/edit`} className="text-slate-600 hover:underline">Edit</Link>
                      <button onClick={() => setTarget(emp)} className="text-red-600 hover:underline">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {emps.loading && <Loader />}
        {!emps.loading && !emps.error && rows.length === 0 && (
          <p className="text-sm text-slate-500 py-6 text-center">No employees found.</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
        <span>{emps.data?.count ?? 0} employees</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={!emps.data?.previous} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {page} of {pages}</span>
          <Button variant="secondary" disabled={!emps.data?.next} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!target}
        title="Delete employee"
        message={`Are you sure you want to delete ${target?.name}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  )
}
