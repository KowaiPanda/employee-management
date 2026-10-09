import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import EmployeeForm from '../components/EmployeeForm'
import Icon from '../components/Icon'

export default function AddEmployee() {
  const navigate = useNavigate()

  const handleSubmit = async (form) => {
    const emp = await api.createEmployee(form)
    navigate(`/employees/${emp.id}`)
  }

  return (
    <div className="max-w-4xl">
      <Link to="/employees" className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-emerald-800"><Icon name="back" className="size-3.5" />Back to employees</Link>
      <div className="mb-8"><h1 className="page-title">Add Employee</h1><p className="page-description">Create a new record in your employee directory.</p></div>
      <EmployeeForm submitLabel="Create employee" onSubmit={handleSubmit} onCancel={() => navigate('/employees')} />
    </div>
  )
}
