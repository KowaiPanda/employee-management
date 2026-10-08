import { useEffect, useState } from 'react'

// Runs an async API call and tracks its data, loading and error state.
// Re-runs whenever `deps` change; call reload() to fetch again manually.
export default function useApi(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let active = true // ignore responses from outdated requests
    setLoading(true)
    setError('')
    fn()
      .then((res) => active && setData(res))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, loading, error, reload: () => setTick((t) => t + 1) }
}
