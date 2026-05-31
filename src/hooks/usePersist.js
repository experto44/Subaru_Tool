/* Subaru Tool — localStorage-backed state hook. */
import { useEffect, useState } from 'react'

export function usePersist(key, init) {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem('subarutool_' + key)
      return s != null ? JSON.parse(s) : init
    } catch {
      return init
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('subarutool_' + key, JSON.stringify(v))
    } catch {
      /* ignore quota / private mode */
    }
  }, [key, v])
  return [v, setV]
}
