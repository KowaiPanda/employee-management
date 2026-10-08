import { useState } from 'react'
import { api } from '../api'
import useApi from '../hooks/useApi'
import Button from './Button'
import ErrorMessage from './ErrorMessage'
import Field from './Field'

const empty = {
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joining_date: '',
  status: 'active',
}

const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (!/^\+?\d{10,14}$/.test(form.phone)) errors.phone = 'Phone must be 10-14 digits'
  if (!form.department) errors.department = 'Department is required'
  if (!form.designation.trim()) errors.designation = 'Designation is required'
  if (!form.joining_date) errors.joining_date = 'Joining date is required'
  else if (form.joining_date > today()) errors.joining_date = 'Joining date cannot be in the future'
  return errors
}

// Shared by Add and Edit pages. `initial` pre-fills the form when editing.
export default function EmployeeForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => {
    const values = { ...empty }
    for (const key in empty) if (initial?.[key] != null) values[key] = String(initial[key])
    return values
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const depts = useApi(api.getDepartments)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((errs) => ({ ...errs, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      // Show the backend's field errors (e.g. duplicate email) next to each field
      const fields = Object.fromEntries(
        Object.entries(err.fields || {}).map(([key, msgs]) => [key, [].concat(msgs)[0]]),
      )
      setErrors(fields)
      setError(fields.detail || 'Please fix the errors below.')
    } finally {
      setSaving(false)
    }
  }

  const props = (name) => ({ name, value: form[name], onChange: handleChange, error: errors[name] })

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white border border-slate-200 rounded-lg p-5">
      <ErrorMessage message={error || depts.error} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" {...props('name')} />
        <Field label="Email" type="email" {...props('email')} />
        <Field label="Phone" {...props('phone')} />
        <Field label="Department" as="select" {...props('department')}>
          <option value="">{depts.loading ? 'Loading...' : 'Select department'}</option>
          {depts.data?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Field>
        <Field label="Designation" {...props('designation')} />
        <Field label="Joining Date" type="date" max={today()} {...props('joining_date')} />
        <Field label="Status" as="select" {...props('status')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  )
}
