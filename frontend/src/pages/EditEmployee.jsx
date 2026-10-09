import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import EmployeeForm from '../components/EmployeeForm'
import ErrorMessage from '../components/ErrorMessage'
import Icon from '../components/Icon'
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
    <div className="max-w-4xl">
      <Link to={`/employees/${id}`} className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-emerald-800"><Icon name="back" className="size-3.5" />Back to employee</Link>
      <div className="mb-8"><h1 className="page-title">Edit Employee</h1><p className="page-description">{data ? `Update the details for ${data.name}.` : 'Update contact and employment information.'}</p></div>
      {loading && <Loader />}
      <ErrorMessage message={error} />
      {data && !loading && !error && (
        <EmployeeForm
          key={id}
          initial={data}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/employees/${id}`)}
        />
      )}
    </div>
  )
}
