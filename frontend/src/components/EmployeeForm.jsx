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
      setError(fields.detail || (Object.keys(fields).length ? 'Please fix the errors below.' : err.message))
    } finally {
      setSaving(false)
    }
  }

  const props = (name) => ({ name, value: form[name], onChange: handleChange, error: errors[name], required: true })

  return (
    <form onSubmit={handleSubmit} noValidate className="panel overflow-hidden">
      {(error || depts.error) && <div className="px-6"><ErrorMessage message={error || depts.error} /></div>}
      <div className="divide-y divide-stone-200">
        <section className="grid gap-6 px-6 py-7 sm:p-8 lg:grid-cols-[180px_minmax(0,1fr)]" aria-labelledby="personal-heading">
          <div><h2 id="personal-heading" className="text-sm font-semibold">Personal details</h2><p className="mt-2 text-xs leading-6 text-stone-500">Name and contact information for this employee.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" className="sm:col-span-2" autoComplete="name" maxLength={100} {...props('name')} />
            <Field label="Email address" type="email" autoComplete="email" maxLength={254} {...props('email')} />
            <Field label="Phone number" type="tel" autoComplete="tel" maxLength={15} hint="10–14 digits; country code is optional." {...props('phone')} />
          </div>
        </section>
        <section className="grid gap-6 px-6 py-7 sm:p-8 lg:grid-cols-[180px_minmax(0,1fr)]" aria-labelledby="employment-heading">
          <div><h2 id="employment-heading" className="text-sm font-semibold">Employment</h2><p className="mt-2 text-xs leading-6 text-stone-500">Their role, department and current status.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Department" as="select" disabled={depts.loading} {...props('department')}>
              <option value="">{depts.loading ? 'Loading...' : 'Select department'}</option>
              {depts.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Field>
            <Field label="Designation" autoComplete="organization-title" maxLength={100} {...props('designation')} />
            <Field label="Joining date" type="date" max={today()} {...props('joining_date')} />
            <Field label="Status" as="select" {...props('status')}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </Field>
          </div>
        </section>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 bg-stone-50 px-6 py-5 sm:px-8">
        <p className="text-xs text-stone-500">All fields are required.</p>
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving || depts.loading}>{saving ? 'Saving...' : submitLabel}</Button>
        </div>
      </div>
    </form>
  )
}
