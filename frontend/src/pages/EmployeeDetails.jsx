import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorMessage from '../components/ErrorMessage'
import Icon from '../components/Icon'
import Loader from '../components/Loader'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import { formatDate, initials } from '../utils/format'

export default function EmployeeDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: emp, loading, error, reload } = useApi(() => api.getEmployee(id), [id])
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteEmployee(id)
      navigate('/employees')
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
      setConfirm(false)
    }
  }

  if (loading) return <Loader />
  if (error) return <div><Link to="/employees" className="text-sm text-emerald-800 hover:underline">Back to employees</Link><ErrorMessage message={error} onRetry={reload} /></div>

  const contact = [
    ['Email address', <a key="email" href={`mailto:${emp.email}`} className="break-all hover:text-emerald-800">{emp.email}</a>],
    ['Phone number', <a key="phone" href={`tel:${emp.phone}`} className="hover:text-emerald-800">{emp.phone}</a>],
  ]
  const employment = [
    ['Department', emp.department_name],
    ['Designation', emp.designation],
    ['Joining date', formatDate(emp.joining_date)],
    ['Status', <StatusBadge key="status" status={emp.status} />],
  ]

  return (
    <div className="max-w-5xl">
      <Link to="/employees" className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-emerald-800"><Icon name="back" className="size-3.5" />Back to employees</Link>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg font-semibold text-emerald-900">{initials(emp.name)}</span>
          <div className="min-w-0"><p className="mb-1.5 text-xs text-stone-500">Employee #{emp.id}</p><h1 className="page-title break-words">{emp.name}</h1><p className="mt-2 text-sm text-stone-500">{emp.designation} · {emp.department_name}</p></div>
        </div>
        {user.isAdmin && (
          <div className="flex gap-2">
            <Button to={`/employees/${id}/edit`} variant="secondary"><Icon name="edit" />Edit employee</Button>
            <Button variant="danger" onClick={() => setConfirm(true)}><Icon name="trash" />Delete</Button>
          </div>
        )}
      </div>

      <ErrorMessage message={deleteError} />

      <div className="grid items-start gap-6 md:grid-cols-2">
        {[['Contact information', contact], ['Employment', employment]].map(([heading, fields]) => (
          <section key={heading} className="panel overflow-hidden">
            <h2 className="border-b border-stone-200 px-6 py-5 text-sm font-semibold">{heading}</h2>
            <dl className="divide-y divide-stone-100 px-6">
              {fields.map(([label, value]) => <div key={label} className="py-5"><dt className="text-xs text-stone-500">{label}</dt><dd className="mt-2 text-sm font-medium">{value}</dd></div>)}
            </dl>
          </section>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2 border-t border-stone-200 pt-5 text-xs leading-6 text-stone-500">
        <p>Created <span className="ml-1 text-stone-500">{new Date(emp.created_at).toLocaleString()}</span></p>
        <p>Last updated <span className="ml-1 text-stone-500">{new Date(emp.updated_at).toLocaleString()}</span></p>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Delete employee"
        message={`Are you sure you want to delete ${emp.name}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  )
}
