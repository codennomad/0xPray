import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useVault } from '@/store/vault'
import { PrayerCard } from '@/components/prayer/PrayerCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES, CATEGORY_LABEL } from '@/lib/utils'
import type { PrayerCategory } from '@/types'

type Filter = 'ALL' | PrayerCategory | 'ANSWERED'

export default function Prayers() {
  const navigate = useNavigate()
  const { vault } = useVault()
  const prayers = vault?.prayers ?? []

  const [filter, setFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = prayers
    if (filter === 'ANSWERED') list = list.filter((p) => p.answered)
    else if (filter !== 'ALL') list = list.filter((p) => p.category === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
      )
    }
    return list
  }, [prayers, filter, search])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-5 pt-safe pt-4 pb-3 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-xl font-semibold">Orações</h1>
            <p className="mono-label mt-0.5">
              {filtered.length} de {prayers.length}
            </p>
          </div>
          <Button variant="flame" size="icon" onClick={() => navigate('/editor')}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" strokeWidth={1.5} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar orações..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-s2 pl-9 pr-4 py-2.5 text-text placeholder:text-faint font-body text-[14px] focus:outline-none focus:border-[var(--color-border-flame)]"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setFilter('ALL')}>
            <Badge variant={filter === 'ALL' ? 'selected' : 'default'}>Todas</Badge>
          </button>
          <button onClick={() => setFilter('ANSWERED')}>
            <Badge variant={filter === 'ANSWERED' ? 'answered' : 'default'}>Respondidas</Badge>
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}>
              <Badge variant={filter === cat ? 'selected' : 'default'}>{CATEGORY_LABEL[cat]}</Badge>
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <div className="scroll-area px-5 pb-nav">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="font-display text-sm text-muted">
              {search ? 'Nenhuma oração encontrada' : 'Nenhuma oração nesta categoria'}
            </p>
            <p className="font-mono text-[10px] text-faint">
              {search ? 'Tente outra busca' : 'Selecione outra categoria'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-4 stagger">
            {filtered.map((p) => (
              <PrayerCard key={p.id} prayer={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
