import { useEffect, useState } from 'react'

export function useHighlightEffect(signal?: number) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (signal === undefined || signal === 0) return
    setActive(true)
    const timeout = setTimeout(() => {
      setActive(false)
    }, 1100)

    return () => {
      clearTimeout(timeout)
    }
  }, [signal])

  return active
}

export default useHighlightEffect
