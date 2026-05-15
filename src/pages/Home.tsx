import { useNavigate } from 'react-router'
import { Lock, Plus, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react'
import { useVault } from '@/store/vault'
import { PrayerCard } from '@/components/prayer/PrayerCard'
import { Button } from '@/components/ui/button'
import { calcStreak, formatDate } from '@/lib/utils'

function StatCard({
  value,
  label,
  color = 'text-flame',
}: {
  value: number | string
  label: string
  color?: string
}) {
  return (
    <div className="flex-1 p-4 rounded-xl border border-[var(--color-border)] bg-s1">
      <div className={`font-display text-3xl font-semibold mb-1 ${color}`}>{value}</div>
      <div className="mono-label">{label}</div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { vault, lock } = useVault()

  const prayers = vault?.prayers ?? []
  const answered = prayers.filter((p) => p.answered).length
  const streak = calcStreak(prayers)
  const recent = prayers.slice(0, 5)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-safe pt-4 pb-4 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #d97706)' }}
          >
            <span className="text-void text-xs font-black font-mono">0x</span>
          </div>
          <div>
            <span className="font-display text-[15px] font-semibold">0xPray</span>
            <span className="font-mono text-[9px] text-faint ml-2">v1.0</span>
          </div>
        </div>
        <button
          onClick={lock}
          className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-faint hover:text-muted hover:border-[var(--color-border-hi)] transition-all"
        >
          <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </header>

      <div className="scroll-area pb-nav px-5 stagger">
        {/* Terminal greeting */}
        <div className="py-5">
          <p className="font-mono text-[10px] text-faint mb-1">
            {`> sys.date — ${formatDate(new Date().toISOString())}`}
          </p>
          <h1 className="font-display text-2xl font-semibold text-text leading-tight cursor">
            {prayers.length === 0 ? 'Bem-vindo ao vault' : 'Seu vault espiritual'}
          </h1>
          <p className="font-jakarta text-sm text-muted mt-1">
            {prayers.length === 0
              ? 'Um espaço privado para suas orações.'
              : `${prayers.length} oração${prayers.length !== 1 ? 'ões' : ''} registrada${prayers.length !== 1 ? 's' : ''}.`}
          </p>
        </div>

        {/* Stats */}
        <div>
          <p className="mono-label mb-3">// estatísticas</p>
          <div className="flex gap-3">
            <StatCard value={prayers.length} label="Orações" />
            <StatCard value={answered} label="Respondidas" color="text-answered" />
            <StatCard value={streak} label="Streak" color="text-text" />
          </div>
        </div>

        {/* Recent prayers */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label">// recentes</p>
            {prayers.length > 0 && (
              <button
                onClick={() => navigate('/prayers')}
                className="font-mono text-[9px] text-flame uppercase tracking-widest hover:text-orange-400 transition-colors"
              >
                ver todas →
              </button>
            )}
          </div>

          {prayers.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center border border-dashed border-[var(--color-border)] rounded-xl bg-dots">
              <div className="w-12 h-12 rounded-full border border-flame/20 bg-flame/8 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-flame/40" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-sm text-muted mb-1">Vault vazio</p>
                <p className="font-mono text-[10px] text-faint">Crie sua primeira oração</p>
              </div>
              <Button variant="flame" size="md" onClick={() => navigate('/editor')}>
                <Plus className="w-4 h-4" />
                Nova Oração
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((p) => (
                <PrayerCard key={p.id} prayer={p} />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        {prayers.length > 0 && (
          <div className="mt-6 flex gap-3">
            <Button
              variant="flame"
              size="md"
              className="flex-1"
              onClick={() => navigate('/editor')}
            >
              <Plus className="w-4 h-4" />
              Nova Oração
            </Button>
            <Button
              variant="terminal"
              size="md"
              className="flex-1"
              onClick={() => navigate('/prayers')}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Ver Vault
            </Button>
          </div>
        )}

        {/* System status */}
        <div className="mt-8 p-3 rounded-lg border border-[var(--color-border)] bg-s1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-answered animate-pulse" />
            <span className="font-mono text-[9px] text-faint">
              AES-256-GCM · PBKDF2/210k · offline-first PWA
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
