import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'default' | 'success' | 'error'
}

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'default') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed top-5 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[9999] pointer-events-none"
        style={{ maxWidth: 320, width: '90vw' }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2.5 px-4 py-3 rounded-lg border',
              'font-mono text-[11px] tracking-wide animate-fade-up glass',
              t.type === 'success' && 'border-answered/30 text-answered',
              t.type === 'error' && 'border-danger/30 text-danger',
              t.type === 'default' && 'border-[var(--color-border-hi)] text-muted'
            )}
          >
            {t.type === 'success' && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
            {t.type === 'default' && <Info className="w-3.5 h-3.5 flex-shrink-0" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function Toaster() {
  return null
}
