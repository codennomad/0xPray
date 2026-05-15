import { useState } from 'react'
import {
  Lock,
  Key,
  Download,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  ChevronRight,
  BookOpen,
  Shield,
} from 'lucide-react'
import { useVault } from '@/store/vault'
import { destroyVault, exportPlain } from '@/lib/storage'
import { PinScreen } from '@/components/pin/PinScreen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toaster'

function SettingRow({
  icon: Icon,
  title,
  sub,
  onClick,
  danger,
  children,
}: {
  icon: React.ElementType
  title: string
  sub?: string
  onClick?: () => void
  danger?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border bg-s1 transition-colors ${
        danger
          ? 'border-danger/20 hover:border-danger/40'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-hi)]'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full border flex items-center justify-center ${
            danger
              ? 'border-danger/25 bg-danger/8 text-danger'
              : 'border-[var(--color-border)] bg-s2 text-flame'
          }`}
        >
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div>
          <p className={`text-[14px] font-medium ${danger ? 'text-danger' : 'text-text'}`}>
            {title}
          </p>
          {sub && <p className="font-mono text-[9px] text-faint mt-0.5">{sub}</p>}
        </div>
      </div>
      {children ?? (onClick && <ChevronRight className="w-4 h-4 text-faint" strokeWidth={1.5} />)}
    </div>
  )
}

export default function Settings() {
  const { vault, lock, updateSettings } = useVault()
  if (!vault) return null
  const { toast } = useToast()

  const [showChangePin, setShowChangePin] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(vault?.settings.apiKeyEncrypted ?? '')
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  if (showChangePin) {
    return (
      <PinScreen
        mode="change"
        onChangeComplete={() => {
          setShowChangePin(false)
          toast('PIN alterado com sucesso', 'success')
        }}
      />
    )
  }

  const handleSaveApiKey = async () => {
    await updateSettings({ apiKeyEncrypted: apiKeyInput.trim() })
    toast('Chave API salva no vault', 'success')
    setShowApiKey(false)
  }

  const handleExport = () => {
    if (!vault) return
    const json = exportPlain(vault)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `0xpray-export-${new Date().toISOString().slice(0, 10)}.json`,
    })
    a.click()
    URL.revokeObjectURL(url)
    toast('Vault exportado', 'success')
  }

  const handleClearAll = () => {
    if (!window.confirm('Apagar TODO o vault? Esta ação é irreversível.')) return
    destroyVault()
    window.location.reload()
  }

  const focusFonts = [
    { value: 'jakarta', label: 'Plus Jakarta Sans' },
    { value: 'mono', label: 'JetBrains Mono' },
    { value: 'display', label: 'Space Grotesk' },
  ] as const

  const models = [
    { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 (rápido)' },
    { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6 (qualidade)' },
  ] as const

  return (
    <div className="flex flex-col h-full">
      <header className="px-5 pt-safe pt-4 pb-4 border-b border-[var(--color-border)] flex-shrink-0">
        <h1 className="font-display text-xl font-semibold">Configurações</h1>
        <p className="mono-label mt-1">// vault &amp; sistema</p>
      </header>

      <div className="scroll-area px-5 pb-nav">
        <div className="flex flex-col gap-3 pt-4 stagger">
          {/* Security */}
          <p className="mono-label pt-2">// segurança</p>

          <SettingRow
            icon={Lock}
            title="Alterar PIN"
            sub="Mude o PIN de acesso ao vault"
            onClick={() => setShowChangePin(true)}
          />

          <SettingRow
            icon={Shield}
            title="Criptografia"
            sub="AES-256-GCM · PBKDF2/210k iterações"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-answered" />
          </SettingRow>

          {/* AI */}
          <p className="mono-label pt-2">// inteligência artificial</p>

          <SettingRow
            icon={Key}
            title="Chave API Anthropic"
            sub={vault?.settings.apiKeyEncrypted ? 'Configurada' : 'Não configurada'}
            onClick={() => setShowApiKey(!showApiKey)}
          />

          {showApiKey && (
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-flame/20 bg-flame/5 animate-fade-up">
              <p className="mono-label">Chave API (armazenada no vault)</p>
              <div className="relative">
                <Input
                  type={apiKeyVisible ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="pr-10"
                />
                <button
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
                >
                  {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button variant="flame" size="sm" onClick={handleSaveApiKey}>
                Salvar Chave
              </Button>
              <p className="font-mono text-[9px] text-faint">
                A chave é armazenada criptografada dentro do vault local.
              </p>
            </div>
          )}

          {/* Model */}
          <SettingRow icon={Sparkles} title="Modelo de IA" sub={vault?.settings.aiModel}>
            <select
              value={vault?.settings.aiModel}
              onChange={(e) =>
                updateSettings({
                  aiModel: e.target.value as typeof vault.settings.aiModel,
                })
              }
              className="font-mono text-[10px] text-flame bg-transparent border-none outline-none cursor-pointer"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value} className="bg-s2 text-text">
                  {m.label}
                </option>
              ))}
            </select>
          </SettingRow>

          {/* Focus mode */}
          <p className="mono-label pt-2">// modo foco</p>

          <SettingRow icon={BookOpen} title="Fonte do Modo Foco" sub="Fonte usada na leitura">
            <select
              value={vault?.settings.focusFont}
              onChange={(e) =>
                updateSettings({ focusFont: e.target.value as typeof vault.settings.focusFont })
              }
              className="font-mono text-[10px] text-flame bg-transparent border-none outline-none cursor-pointer"
            >
              {focusFonts.map((f) => (
                <option key={f.value} value={f.value} className="bg-s2 text-text">
                  {f.label}
                </option>
              ))}
            </select>
          </SettingRow>

          {/* Data */}
          <p className="mono-label pt-2">// dados</p>

          <SettingRow
            icon={Download}
            title="Exportar Vault"
            sub="JSON descriptografado · backup local"
            onClick={handleExport}
          />

          <SettingRow
            icon={Lock}
            title="Bloquear App"
            sub="Bloquear e limpar memória"
            onClick={lock}
          />

          <SettingRow
            icon={Trash2}
            title="Apagar Vault"
            sub="Remove todos os dados — irreversível"
            onClick={handleClearAll}
            danger
          />

          {/* Footer */}
          <div className="py-6 text-center">
            <p className="mono-label">0xPray v1.0 · React 19 · Vite · Tailwind 4</p>
            <p className="mono-label mt-1">offline-first PWA · encrypted at rest</p>
          </div>
        </div>
      </div>
    </div>
  )
}
