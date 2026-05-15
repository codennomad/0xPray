import { useState } from 'react'
import { Sparkles, AlertTriangle, Loader2 } from 'lucide-react'
import { generatePrayer } from '@/lib/ai'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES, CATEGORY_LABEL, CATEGORY_GLYPH } from '@/lib/utils'
import { useToast } from '@/components/ui/toaster'
import type { PrayerCategory } from '@/types'

interface AIGeneratorProps {
  apiKey: string
  model: string
  onGenerated: (text: string, category: PrayerCategory) => void
}

const lengths = ['short', 'medium', 'long'] as const
type Length = (typeof lengths)[number]

const lengthLabel: Record<Length, string> = {
  short: 'Curta',
  medium: 'Média',
  long: 'Longa',
}

export function AIGenerator({ apiKey, model, onGenerated }: AIGeneratorProps) {
  const { toast } = useToast()
  const [category, setCategory] = useState<PrayerCategory>('PESSOAL')
  const [intention, setIntention] = useState('')
  const [length, setLength] = useState<Length>('medium')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const text = await generatePrayer(apiKey, { category, intention, length, model })
      onGenerated(text, category)
      toast('Oração gerada — revise e salve', 'success')
    } catch (err) {
      toast(
        err instanceof Error ? err.message : 'Erro ao gerar oração',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      {/* Categoria */}
      <div>
        <p className="mono-label mb-3">Categoria</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="transition-all active:scale-95"
            >
              <Badge variant={category === cat ? 'selected' : 'default'}>
                {CATEGORY_GLYPH[cat]} {CATEGORY_LABEL[cat]}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Intenção */}
      <div>
        <p className="mono-label mb-2">Intenção (opcional)</p>
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="Ex: cura para um familiar, paz no trabalho..."
          rows={3}
          className="w-full rounded-lg border border-[var(--color-border)] bg-s2 px-4 py-3 text-text placeholder:text-faint font-jakarta text-[14px] leading-relaxed transition-colors focus:outline-none focus:border-[var(--color-border-flame)] focus:ring-1 focus:ring-flame/20 resize-none"
        />
      </div>

      {/* Comprimento */}
      <div>
        <p className="mono-label mb-2">Comprimento</p>
        <div className="flex gap-2">
          {lengths.map((l) => (
            <button
              key={l}
              onClick={() => setLength(l)}
              className="flex-1 transition-all active:scale-95"
            >
              <Badge
                variant={length === l ? 'selected' : 'default'}
                className="w-full justify-center"
              >
                {lengthLabel[l]}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <Button
        variant="flame"
        size="lg"
        className="w-full"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Gerar Oração
          </>
        )}
      </Button>

      <p className="font-mono text-[9px] text-faint text-center tracking-wide">
        powered by Claude · a oração gerada vai para o editor para revisão
      </p>
    </div>
  )
}

export function AINoKey() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center animate-fade-in">
      <AlertTriangle className="w-8 h-8 text-flame/40" strokeWidth={1.5} />
      <div>
        <p className="font-display text-sm text-muted mb-1">Chave API não configurada</p>
        <p className="font-mono text-[10px] text-faint">
          Adicione sua chave Anthropic em Configurações → IA
        </p>
      </div>
    </div>
  )
}
