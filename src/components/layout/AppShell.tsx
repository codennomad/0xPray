import { useLocation } from 'react-router'
import { useVault } from '@/store/vault'
import { PinScreen } from '@/components/pin/PinScreen'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

const FULL_SCREEN_ROUTES = ['/focus']

export function AppShell({ children }: AppShellProps) {
  const { lockState } = useVault()
  const location = useLocation()

  const isFullScreen = FULL_SCREEN_ROUTES.some((r) => location.pathname.startsWith(r))

  if (lockState !== 'unlocked') {
    return <PinScreen />
  }

  return (
    <div className="flex flex-col h-full bg-void overflow-hidden">
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      {!isFullScreen && <BottomNav />}
    </div>
  )
}
