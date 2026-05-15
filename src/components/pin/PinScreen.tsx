import { useState, useEffect, useCallback } from 'react'
import { Flame } from 'lucide-react'
import { vaultExists, initVault, openVault } from '@/lib/storage'
import { reencryptVault } from '@/lib/storage'
import { useVault } from '@/store/vault'
import type { AppLockState } from '@/types'

const PIN_LEN = 4

type PinMode = 'setup' | 'unlock' | 'change-old' | 'change-new'

interface PinScreenProps {
  mode?: 'app' | 'change'
  onChangeComplete?: () => void
}

export function PinScreen({ mode = 'app', onChangeComplete }: PinScreenProps) {
  const { unlock, vault, key } = useVault()
  const [pinMode, setPinMode] = useState<PinMode>(() =>
    mode === 'change' ? 'change-old' : vaultExists() ? 'unlock' : 'setup'
  )
  const [buf, setBuf] = useState('')
  const [first, setFirst] = useState('')
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [loading, setLoading] = useState(false)

  const subtitles: Record<PinMode, string> = {
    setup: first ? 'confirme o pin' : 'crie um pin de 4 dígitos',
    unlock: 'insira o pin',
    'change-old': 'pin atual',
    'change-new': first ? 'confirme o novo pin' : 'novo pin de 4 dígitos',
  }

  const shake = useCallback((msg: string) => {
    setError(msg)
    setShaking(true)
    setTimeout(() => {
      setShaking(false)
      setBuf('')
    }, 420)
  }, [])

  const handleDone = useCallback(
    async (pin: string) => {
      setLoading(true)
      try {
        if (pinMode === 'setup') {
          if (!first) {
            setFirst(pin)
            setBuf('')
            return
          }
          if (pin !== first) {
            setFirst('')
            shake('PINs não coincidem')
            return
          }
          const newKey = await initVault(pin)
          const { vault: newVault } = await openVault(pin)
          unlock(newKey, newVault)
          return
        }

        if (pinMode === 'unlock') {
          const { key: k, vault: v } = await openVault(pin)
          unlock(k, v)
          return
        }

        if (pinMode === 'change-old') {
          try {
            await openVault(pin)
            setPinMode('change-new')
            setBuf('')
          } catch {
            shake('PIN incorreto')
          }
          return
        }

        if (pinMode === 'change-new') {
          if (!first) {
            setFirst(pin)
            setBuf('')
            return
          }
          if (pin !== first) {
            setFirst('')
            shake('PINs não coincidem')
            return
          }
          if (!key || !vault) return
          await reencryptVault(key, pin, vault)
          onChangeComplete?.()
          return
        }
      } catch {
        shake('PIN incorreto')
      } finally {
        setLoading(false)
      }
    },
    [pinMode, first, shake, unlock, key, vault, onChangeComplete]
  )

  const handleKey = useCallback(
    (k: string) => {
      if (loading || buf.length >= PIN_LEN) return
      const next = buf + k
      setBuf(next)
      setError('')
      if (next.length === PIN_LEN) {
        setTimeout(() => handleDone(next), 60)
      }
    },
    [buf, loading, handleDone]
  )

  const handleBackspace = useCallback(() => {
    setBuf((b) => b.slice(0, -1))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key)
      if (e.key === 'Backspace') handleBackspace()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKey, handleBackspace])

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="fixed inset-0 bg-void z-50 flex flex-col items-center justify-center bg-dots">
      <div className="flex flex-col items-center gap-10 px-8" style={{ maxWidth: 320, width: '100%' }}>
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center glow-flame"
            style={{ background: 'linear-gradient(135deg, #f97316, #d97706)' }}
          >
            <Flame className="w-7 h-7 text-void" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">0xPray</span>
          <span className="mono-label text-center">{subtitles[pinMode]}</span>
        </div>

        {/* Dots */}
        <div
          className={`flex gap-4 ${shaking ? 'animate-shake' : ''}`}
          key={`${shaking}`}
        >
          {Array.from({ length: PIN_LEN }, (_, i) => (
            <div
              key={i}
              className={`pin-dot ${i < buf.length ? (shaking ? 'error' : 'filled') : ''}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 72px)',
            gap: '14px',
          }}
        >
          {keys.map((k, i) => {
            if (k === '') return <div key={i} />
            if (k === '⌫')
              return (
                <button
                  key={i}
                  onClick={handleBackspace}
                  className="w-[72px] h-[72px] rounded-full border border-[var(--color-border)] bg-s2 flex items-center justify-center text-muted text-lg transition-all active:scale-90 active:bg-s3 hover:border-[var(--color-border-hi)]"
                >
                  ⌫
                </button>
              )
            return (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className="w-[72px] h-[72px] rounded-full border border-[var(--color-border)] bg-s2 flex items-center justify-center font-display text-2xl font-medium transition-all active:scale-90 active:bg-s3 hover:border-[var(--color-border-hi)]"
              >
                {k}
              </button>
            )
          })}
        </div>

        {/* Error */}
        <p className="font-mono text-[11px] text-danger min-h-4 text-center">{error}</p>

        {loading && (
          <div className="w-4 h-4 rounded-full border-2 border-flame border-t-transparent animate-spin" />
        )}
      </div>
    </div>
  )
}
