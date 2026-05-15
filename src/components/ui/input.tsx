import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-[var(--color-border)] bg-s2 px-4 py-3',
        'text-text placeholder:text-faint font-body text-[15px]',
        'transition-colors focus:outline-none focus:border-[var(--color-border-flame)]',
        'focus:ring-1 focus:ring-flame/20',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
