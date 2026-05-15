import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        flame:
          'bg-flame text-void rounded-xl hover:bg-orange-400 active:scale-[0.97] glow-flame-sm font-display font-semibold',
        outline:
          'border border-[var(--color-border-hi)] text-text bg-transparent rounded-xl hover:border-[var(--color-border-flame)] hover:text-flame active:scale-[0.97]',
        ghost:
          'text-muted bg-transparent rounded-lg hover:text-text hover:bg-white/5 active:scale-[0.97]',
        danger:
          'border border-danger/30 text-danger bg-transparent rounded-xl hover:bg-danger/10 active:scale-[0.97]',
        terminal:
          'font-mono text-[10px] uppercase tracking-widest border border-[var(--color-border)] text-muted bg-s2 rounded-sm hover:border-[var(--color-border-flame)] hover:text-flame active:scale-[0.97]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-6 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: { variant: 'outline', size: 'md' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
