import { useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'default' | 'error' | 'success'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (message: string, type: Toast['type'] = 'default', duration = 2500) => {
      const id = crypto.randomUUID()
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
    },
    []
  )

  return { toasts, toast }
}
