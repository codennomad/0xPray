import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, Save, Trash2, Sparkles, PenLine } from 'lucide-react'
import { useVault } from '@/store/vault'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AIGenerator, AINoKey } from '@/components/prayer/AIGenerator'
import { useToast } from '@/components/ui/toaster'
import { CATEGORIES, CATEGORY_LABEL, CATEGORY_GLYPH } from '@/lib/utils'
import type { PrayerCategory } from '@/types'

type Tab = 'manual' | 'ai'

export default function Editor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const defaultTab = (searchParams.get('tab') as Tab) ?? 'manual'

  const { vault, addPrayer, updatePrayer, deletePrayer } = useVault()
  const { toast } = useToast()

  const isEdit = !!id
  const existing = id ? vault?.prayers.find((p) => p.id === id) : undefined

  const [tab, setTab] = useState<Tab>(defaultTab)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [body, setBody] = useState(existing?.body ?? '')
  const [category, setCategory] = useState<PrayerCategory>(existing?.category ?? 'PESSOAL')
  const [aiGenerated, setAiGenerated] = useState(existing?.aiGenerated ?? false)
  const [saving, setSaving] = useState(false)

  const apiKey = vault?.settings.apiKeyEncrypted ?? ''
  const hasApiKey = apiKey.length > 0

  const handleSave = async () => {
    if (!title.trim()) { toast('Adicione um título', 'error'); return }
    if (!body.trim())  { toast('A oração não pode ser vazia', 'error'); return }

    setSaving(true)
    try {
      if (isEdit && id) {
        await updatePrayer(id, { title: title.trim(), body: body.trim(), category, aiGenerated })
        toast('Oração atualizada', 'success')
      } else {
        await addPrayer({
          title: title.trim(),
          body: body.trim(),
          category,
          answered: false,
          aiGenerated,
          tags: [],
        })
        toast('Oração salva no vault', 'success')
      }
      navigate(-1)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('Excluir esta oração do vault?')) return
    await deletePrayer(id)
    toast('Oração excluída', 'default')
    navigate('/prayers')
  }

  const handleAIGenerated = (text: string, cat: PrayerCategory) => {
    setBody(text)
    setCategory(cat)
    setAiGenerated(true)
    setTab('manual')
    if (!title) setTitle('Oração gerada por IA')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-safe pt-4 pb-4 border-b border-[var(--color-border)] flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-muted hover:text-text hover:border-[var(--color-border-hi)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <h1 className="font-display text-[15px] font-semibold">
          {isEdit ? 'Editar Oração' : 'Nova Oração'}
        </h1>
        <div className="flex gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="w-8 h-8 rounded-full border border-danger/25 flex items-center justify-center text-danger/60 hover:text-danger hover:border-danger/50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
          <Button variant="flame" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] flex-shrink-0">
        {(['manual', 'ai'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors border-b-2 ${
              tab === t
                ? 'border-flame text-flame'
                : 'border-transparent text-faint hover:text-muted'
            }`}
          >
            {t === 'manual' ? <PenLine className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            {t === 'manual' ? 'Manual' : 'IA'}
          </button>
        ))}
      </div>

      <div className="scroll-area px-5 pb-nav">
        {tab === 'manual' ? (
          <div className="flex flex-col gap-5 pt-5 animate-fade-up">
            {/* Title */}
            <div>
              <p className="mono-label mb-2">Título</p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da oração..."
                maxLength={80}
              />
            </div>

            {/* Category */}
            <div>
              <p className="mono-label mb-2">Categoria</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)} className="transition-all active:scale-95">
                    <Badge variant={category === cat ? 'selected' : 'default'}>
                      {CATEGORY_GLYPH[cat]} {CATEGORY_LABEL[cat]}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="mono-label">Oração</p>
                {aiGenerated && (
                  <span className="flex items-center gap-1 font-mono text-[9px] text-flame">
                    <Sparkles className="w-3 h-3" />
                    gerada por IA
                  </span>
                )}
              </div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escreva sua oração aqui..."
                rows={12}
              />
              <p className="mono-label text-right mt-1">{body.length} chars</p>
            </div>
          </div>
        ) : (
          <div className="pt-5">
            {hasApiKey ? (
              <AIGenerator
                apiKey={apiKey}
                model={vault?.settings.aiModel ?? 'claude-haiku-4-5-20251001'}
                onGenerated={handleAIGenerated}
              />
            ) : (
              <AINoKey />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
