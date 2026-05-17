import { useNavigate, useParams } from 'react-router'
import {
  X,
  Edit3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useVault } from '@/store/vault'
import { useToast } from '@/components/ui/toaster'
import { CATEGORY_GLYPH, CATEGORY_LABEL, formatDate } from '@/lib/utils'

export default function Focus() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { vault, updatePrayer } = useVault()
  const { toast } = useToast()

  const prayers = vault?.prayers ?? []
  const idx = prayers.findIndex((p) => p.id === id)
  const prayer = idx >= 0 ? prayers[idx] : null

  if (!prayer) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-faint gap-3">
        <p className="font-mono text-[11px] uppercase tracking-widest">Oração não encontrada</p>
        <button onClick={() => navigate('/prayers')} className="font-mono text-[10px] text-flame">
          ← Voltar
        </button>
      </div>
    )
  }

  const focusFont = vault?.settings.focusFont ?? 'jakarta'
  const bodyFont = {
    jakarta: 'font-jakarta',
    mono: 'font-mono',
    display: 'font-display',
  }[focusFont]

  const goTo = (direction: 1 | -1) => {
    const next = prayers[idx + direction]
    if (next) navigate(`/focus/${next.id}`, { replace: true })
  }

  const handleToggleAnswered = async () => {
    await updatePrayer(prayer.id, {
      answered: !prayer.answered,
      answeredAt: !prayer.answered ? new Date().toISOString() : undefined,
    })
    toast(
      prayer.answered ? 'Marcada como não respondida' : 'Oração marcada como respondida ✓',
      prayer.answered ? 'default' : 'success'
    )
  }

  return (
    <div className="fixed inset-0 bg-void flex flex-col overflow-hidden bg-dots">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-safe pt-5 pb-4 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-faint hover:text-muted transition-all"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-sm text-flame">{CATEGORY_GLYPH[prayer.category]}</span>
          <span className="font-mono text-[10px] text-faint uppercase tracking-widest">
            {CATEGORY_LABEL[prayer.category]}
          </span>
          {prayer.aiGenerated && <Sparkles className="w-3 h-3 text-faint" strokeWidth={1.5} />}
        </div>

        <button
          onClick={() => navigate(`/editor/${prayer.id}`)}
          className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-faint hover:text-muted transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto px-6 pb-6 animate-fade-up"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Title */}
        <h1
          className="font-display text-2xl font-semibold text-text leading-tight mb-6 mt-2"
          style={{ letterSpacing: '-0.3px' }}
        >
          {prayer.title}
        </h1>

        {/* Divider */}
        <div className="divider-flame mb-6" />

        {/* Body */}
        <p
          className={`${bodyFont} text-[16px] leading-[1.9] text-text/90 whitespace-pre-wrap`}
          style={{ fontWeight: focusFont === 'mono' ? 400 : 300 }}
        >
          {prayer.body}
        </p>

        {/* Meta */}
        <div className="mt-8 pt-5 border-t border-[var(--color-border)]">
          <p className="mono-label">{formatDate(prayer.createdAt)}</p>
          {prayer.answeredAt && (
            <p className="mono-label mt-1 text-answered">
              respondida em {formatDate(prayer.answeredAt)}
            </p>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-5 pb-safe pb-6 pt-4 border-t border-[var(--color-border)] flex-shrink-0 glass">
        <button
          onClick={() => goTo(-1)}
          disabled={idx === 0}
          className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-faint hover:text-muted disabled:opacity-20 transition-all hover:border-[var(--color-border-hi)]"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <button
          onClick={handleToggleAnswered}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border font-mono text-[10px] uppercase tracking-widest transition-all ${
            prayer.answered
              ? 'border-answered/40 text-answered bg-answered/8 hover:bg-answered/12'
              : 'border-[var(--color-border-hi)] text-muted hover:border-flame/40 hover:text-flame'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={prayer.answered ? 2.5 : 1.5} />
          {prayer.answered ? 'Respondida' : 'Marcar Respondida'}
        </button>

        <button
          onClick={() => goTo(1)}
          disabled={idx === prayers.length - 1}
          className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-faint hover:text-muted disabled:opacity-20 transition-all hover:border-[var(--color-border-hi)]"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
