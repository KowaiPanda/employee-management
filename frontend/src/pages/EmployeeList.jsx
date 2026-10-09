import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorMessage from '../components/ErrorMessage'
import Icon from '../components/Icon'
import Loader from '../components/Loader'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import useDebounce from '../hooks/useDebounce'
import { formatDate, initials } from '../utils/format'

const PAGE_SIZE = 10 // matches PAGE_SIZE in Django settings
function EmployeeActions({ emp, isAdmin, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/employees/${emp.id}`} aria-label={`View ${emp.name}`} className="mr-1 inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50">View<Icon name="arrow" className="size-3.5" /></Link>
      {isAdmin && <>
        <Link to={`/employees/${emp.id}/edit`} aria-label={`Edit ${emp.name}`} title="Edit employee" className="rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700"><Icon name="edit" /></Link>
        <button onClick={() => onDelete(emp)} aria-label={`Delete ${emp.name}`} title="Delete employee" className="rounded-md p-2 text-stone-500 hover:bg-rose-50 hover:text-rose-700"><Icon name="trash" /></button>
      </>}
    </div>
  )
}

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
  const filtered = !!(search || dept || status)
  const clearFilters = () => { setSearch(''); setDept(''); setStatus(''); setPage(1) }
  const first = rows.length ? (page - 1) * PAGE_SIZE + 1 : 0
  const last = rows.length ? first + rows.length - 1 : 0

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="page-title">Employees</h1><p className="page-description">Your team directory. Find a person, review their details, or update a record.</p></div>
        {user.isAdmin && (
          <Button to="/employees/new"><Icon name="plus" />Add Employee</Button>
        )}
      </div>

      <ErrorMessage message={depts.error} onRetry={depts.reload} />
      <ErrorMessage message={emps.error} onRetry={emps.reload} />
      <ErrorMessage message={deleteError} />

      <section className="panel overflow-hidden" aria-label="Employee directory" aria-busy={emps.loading}>
        <div className="grid gap-3 border-b border-stone-200 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_150px] lg:p-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-stone-500" />
            <input className="control pl-10" aria-label="Search employees" placeholder="Search name, email, phone or role…" value={search} onChange={onFilter(setSearch)} />
          </div>
          <select className="control" aria-label="Filter by department" value={dept} onChange={onFilter(setDept)} disabled={depts.loading}>
            <option value="">All departments</option>
            {depts.data?.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <select className="control" aria-label="Filter by status" value={status} onChange={onFilter(setStatus)}>
            <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>
        {filtered && <div className="flex items-center justify-between gap-3 border-b border-stone-100 bg-stone-50 px-5 py-2.5 text-xs text-stone-500"><span>Showing filtered results</span><button onClick={clearFilters} className="flex items-center gap-1.5 font-medium text-stone-700 hover:text-emerald-800"><Icon name="close" className="size-3.5" />Clear filters</button></div>}

        {!emps.loading && !emps.error && <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[880px] text-left text-sm">
              <caption className="sr-only">Employee contact and employment details</caption>
              <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500"><tr>
                {['Employee', 'Department / Role', 'Phone', 'Joined', 'Status', 'Actions'].map((heading) => <th key={heading} scope="col" className={`px-5 py-3.5 font-medium ${heading === 'Actions' ? 'text-right' : ''}`}>{heading}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((emp) => <tr key={emp.id} className="transition-colors hover:bg-stone-50/70">
                  <td className="px-5 py-4"><div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-semibold text-stone-600">{initials(emp.name)}</span>
                    <div><div className="flex items-center gap-2"><Link to={`/employees/${emp.id}`} className="font-medium hover:text-emerald-800">{emp.name}</Link><span className="text-[10px] text-stone-500">#{emp.id}</span></div><p className="mt-1 text-xs text-stone-500">{emp.email}</p></div>
                  </div></td>
                  <td className="px-5 py-4"><p className="text-stone-700">{emp.department_name}</p><p className="mt-1 text-xs text-stone-500">{emp.designation}</p></td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs tabular-nums text-stone-500">{emp.phone}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-stone-500">{formatDate(emp.joining_date)}</td>
                  <td className="px-5 py-4"><StatusBadge status={emp.status} /></td>
                  <td className="px-4 py-4"><EmployeeActions emp={emp} isAdmin={user.isAdmin} onDelete={setTarget} /></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-stone-200 md:hidden">
            {rows.map((emp) => <li key={emp.id} className="p-5">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link to={`/employees/${emp.id}`} className="font-medium hover:text-emerald-800">{emp.name}</Link><p className="mt-1 text-xs text-stone-500">{emp.designation} · {emp.department_name}</p></div><StatusBadge status={emp.status} /></div>
              <div className="mt-4 space-y-1.5 text-xs text-stone-500"><p className="break-all">{emp.email}</p><p>{emp.phone}</p><p>Joined {formatDate(emp.joining_date)}<span className="ml-3 text-stone-500">#{emp.id}</span></p></div>
              <div className="mt-3"><EmployeeActions emp={emp} isAdmin={user.isAdmin} onDelete={setTarget} /></div>
            </li>)}
          </ul>
        </>}
        {emps.loading && <Loader />}
        {!emps.loading && !emps.error && rows.length === 0 && (
          <div className="px-5 py-16 text-center"><Icon name="people" className="mx-auto mb-4 size-7 text-stone-300" /><h2 className="text-sm font-medium">No employees found.</h2><p className="mt-2 text-xs text-stone-500">{filtered ? 'Try a different search or clear your filters.' : user.isAdmin ? 'Add your first employee to get started.' : 'Employee records will appear here once they are added.'}</p></div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-5 py-4 text-xs text-stone-500">
          <span aria-live="polite">{emps.loading ? 'Loading employees…' : `Showing ${first}–${last} of ${emps.data?.count ?? 0} employees`}</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="min-h-8 px-2.5 py-1 text-xs" disabled={emps.loading || !emps.data?.previous} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="px-1 tabular-nums">{page} / {pages}</span>
            <Button variant="secondary" className="min-h-8 px-2.5 py-1 text-xs" disabled={emps.loading || !emps.data?.next} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </section>

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
