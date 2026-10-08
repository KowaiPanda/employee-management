import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'

export default function EmployeeDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: emp, loading, error } = useApi(() => api.getEmployee(id), [id])
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
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
  if (error) return <ErrorMessage message={error} />

  const fields = [
    ['ID', emp.id],
    ['Name', emp.name],
    ['Email', emp.email],
    ['Phone', emp.phone],
    ['Department', emp.department_name],
    ['Designation', emp.designation],
    ['Joining Date', emp.joining_date],
    ['Status', <StatusBadge key="status" status={emp.status} />],
    ['Created At', new Date(emp.created_at).toLocaleString()],
    ['Updated At', new Date(emp.updated_at).toLocaleString()],
  ]

  return (
    <div className="max-w-3xl">
      <Link to="/employees" className="text-sm text-indigo-600 hover:underline">&larr; Back to employees</Link>
      <div className="flex items-center mt-2 mb-4">
        <h1 className="text-xl font-semibold">{emp.name}</h1>
        {user.isAdmin && (
          <div className="ml-auto flex gap-2">
            <Button to={`/employees/${id}/edit`} variant="secondary">Edit</Button>
            <Button variant="danger" onClick={() => setConfirm(true)}>Delete</Button>
          </div>
        )}
      </div>

      <ErrorMessage message={deleteError} />

      <dl className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {fields.map(([label, value]) => (
          <div key={label} className="grid grid-cols-3 px-5 py-3 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="col-span-2">{value}</dd>
          </div>
        ))}
      </dl>

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
