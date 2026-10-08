import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import EmployeeForm from '../components/EmployeeForm'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import useApi from '../hooks/useApi'

export default function EditEmployee() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useApi(() => api.getEmployee(id), [id])

  const handleSubmit = async (form) => {
    await api.updateEmployee(id, form)
    navigate(`/employees/${id}`)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Edit Employee</h1>
      {loading && <Loader />}
      <ErrorMessage message={error} />
      {data && (
        <EmployeeForm
          initial={data}
          submitLabel="Save"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/employees/${id}`)}
        />
      )}
    </div>
  )
}
