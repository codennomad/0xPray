import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-[var(--color-border)] bg-s2 px-4 py-3',
        'text-text placeholder:text-faint font-jakarta text-[15px] leading-relaxed',
        'transition-colors focus:outline-none focus:border-[var(--color-border-flame)]',
        'focus:ring-1 focus:ring-flame/20 resize-none',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

export { Textarea }
