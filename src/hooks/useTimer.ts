import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(seconds: number, running: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const expireRef = useRef(onExpire)
  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  const reset = useCallback((s?: number) => {
    setRemaining(s ?? seconds)
  }, [seconds])

  useEffect(() => {
    if (!running || remaining <= 0) return
    const t = window.setTimeout(() => {
      setRemaining((r) => {
        const next = r - 1
        if (next <= 0) {
          expireRef.current()
          return 0
        }
        return next
      })
    }, 1000)
    return () => window.clearTimeout(t)
  }, [running, remaining])

  return { remaining, reset }
}
