import { useNavigate } from 'react-router'
import { CheckCircle2, Sparkles, Eye } from 'lucide-react'
import { cn, CATEGORY_GLYPH, CATEGORY_LABEL, timeAgo, truncate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Prayer } from '@/types'

interface PrayerCardProps {
  prayer: Prayer
  className?: string
}

export function PrayerCard({ prayer, className }: PrayerCardProps) {
  const navigate = useNavigate()

  return (
    <article
      onClick={() => navigate(`/focus/${prayer.id}`)}
      className={cn(
        'group relative p-4 rounded-xl border border-[var(--color-border)] bg-s1',
        'cursor-pointer transition-all duration-200',
        'hover:border-[var(--color-border-hi)] hover:bg-s2',
        'active:scale-[0.99]',
        prayer.answered && 'border-answered/20',
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm',
              'border border-flame/20 bg-flame/8 text-flame'
            )}
          >
            {CATEGORY_GLYPH[prayer.category]}
          </span>
          <h3 className="font-display text-[14px] font-medium text-text truncate leading-tight">
            {prayer.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {prayer.aiGenerated && (
            <Sparkles className="w-3 h-3 text-faint" strokeWidth={1.5} />
          )}
          {prayer.answered && (
            <CheckCircle2 className="w-3.5 h-3.5 text-answered" strokeWidth={2} />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="divider-h mb-3" />

      {/* Body preview */}
      <p className="font-jakarta text-[13px] text-muted leading-relaxed mb-3">
        {truncate(prayer.body, 120)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Badge variant={prayer.answered ? 'answered' : 'default'}>
          {CATEGORY_LABEL[prayer.category]}
        </Badge>
        <div className="flex items-center gap-2">
          <span className="mono-label text-faint">{timeAgo(prayer.createdAt)}</span>
          <Eye
            className="w-3.5 h-3.5 text-faint opacity-0 group-hover:opacity-100 transition-opacity"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </article>
  )
}
