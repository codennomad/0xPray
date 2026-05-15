import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'flame' | 'answered' | 'danger' | 'selected'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono text-[9px] uppercase tracking-widest',
        'px-2.5 py-1 rounded-full border whitespace-nowrap select-none',
        {
          default: 'border-[var(--color-border-hi)] text-muted bg-white/4',
          flame: 'border-flame/40 text-flame bg-flame/10',
          selected: 'border-flame bg-flame text-void font-bold',
          answered: 'border-answered/30 text-answered bg-answered/10',
          danger: 'border-danger/30 text-danger bg-danger/10',
        }[variant],
        className
      )}
      {...props}
    />
  )
}
