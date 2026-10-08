import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import EmployeeForm from '../components/EmployeeForm'

export default function AddEmployee() {
  const navigate = useNavigate()

  const handleSubmit = async (form) => {
    const emp = await api.createEmployee(form)
    navigate(`/employees/${emp.id}`)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Add Employee</h1>
      <EmployeeForm submitLabel="Create" onSubmit={handleSubmit} onCancel={() => navigate('/employees')} />
    </div>
  )
}
