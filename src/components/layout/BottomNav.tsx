import { NavLink } from 'react-router'
import { Home, List, PlusCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Início', Icon: Home, exact: true },
  { to: '/prayers', label: 'Orações', Icon: List },
  { to: '/editor', label: 'Nova', Icon: PlusCircle },
  { to: '/settings', label: 'Config', Icon: Settings },
]

export function BottomNav() {
  return (
    <nav
      className="flex-shrink-0 glass border-t border-[var(--color-border)] pb-safe"
      style={{ zIndex: 40 }}
    >
      <div className="flex">
        {items.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
                'font-mono text-[9px] uppercase tracking-widest',
                isActive ? 'text-flame' : 'text-faint hover:text-muted'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn('w-5 h-5 transition-all', isActive && 'glow-flame-sm')}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
