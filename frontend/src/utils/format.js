export const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase()

// Date-only employee fields should keep their calendar day in every timezone.
export const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric',
})
