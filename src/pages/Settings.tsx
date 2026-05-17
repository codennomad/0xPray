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
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  UserPlus,
} from 'lucide-react'
import { useVault } from '@/store/vault'
import { useAuth } from '@/store/auth'
import { destroyVault, exportPlain, loadMeta, getVersion, setVersion } from '@/lib/storage'
import { register, login, logout, pushVault, pullVault } from '@/lib/api'
import { decrypt } from '@/lib/crypto'
import type { Vault } from '@/types'
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
  const { vault, lock, unlock, updateSettings, key } = useVault()
  if (!vault) return null
  const { toast } = useToast()
  const { user, setUser, signOut } = useAuth()

  const [showChangePin, setShowChangePin] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(vault?.settings.apiKeyEncrypted ?? '')
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  // Cloud auth state
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)

  const handleAuth = async () => {
    if (!authEmail || !authPassword) return
    setAuthLoading(true)
    try {
      const fn = authMode === 'login' ? login : register
      const { token, user: u } = await fn(authEmail, authPassword)
      setUser(u, token)
      setShowAuthForm(false)
      setAuthEmail('')
      setAuthPassword('')
      toast(authMode === 'login' ? 'Conectado!' : 'Conta criada!', 'success')
    } catch (e: unknown) {
      toast((e instanceof Error ? e.message : 'Erro') , 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    signOut()
    toast('Desconectado', 'success')
  }

  const handleSyncPush = async () => {
    const meta = loadMeta()
    if (!meta) return
    setSyncLoading(true)
    try {
      await pushVault(meta, getVersion())
      toast('Vault sincronizado', 'success')
    } catch (e: unknown) {
      toast((e instanceof Error ? e.message : 'Erro de sync'), 'error')
    } finally {
      setSyncLoading(false)
    }
  }

  const handleSyncPull = async () => {
    if (!key) return
    setSyncLoading(true)
    try {
      const result = await pullVault()
      if (!result) { toast('Nenhum vault no servidor', 'error'); return }
      const { meta, version } = result
      const plain = await decrypt(key, meta.iv, meta.ct).catch(() => null)
      if (!plain) { toast('PIN diferente do vault no servidor', 'error'); return }
      const remoteVault = JSON.parse(plain) as Vault
      // key stays the same — same PIN encrypts both local and remote
      unlock(key, remoteVault)
      localStorage.setItem('0xpray_v2', JSON.stringify(meta))
      setVersion(version)
      toast('Vault restaurado do servidor', 'success')
    } catch (e: unknown) {
      toast((e instanceof Error ? e.message : 'Erro ao puxar vault'), 'error')
    } finally {
      setSyncLoading(false)
    }
  }

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
          {/* Cloud Sync */}
          <p className="mono-label pt-2">// sincronização</p>

          {user ? (
            <>
              <SettingRow
                icon={Cloud}
                title="Conta conectada"
                sub={user.email}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-answered" />
              </SettingRow>

              <div className="flex gap-2">
                <button
                  onClick={handleSyncPush}
                  disabled={syncLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-border)] bg-s1 text-[12px] font-mono text-flame hover:border-flame/40 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                  Enviar
                </button>
                <button
                  onClick={handleSyncPull}
                  disabled={syncLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-border)] bg-s1 text-[12px] font-mono text-muted hover:border-[var(--color-border-hi)] disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                  Restaurar
                </button>
              </div>

              <SettingRow
                icon={LogOut}
                title="Sair da conta"
                sub="Desconectar do servidor"
                onClick={handleLogout}
              />
            </>
          ) : (
            <>
              <SettingRow
                icon={showAuthForm ? CloudOff : Cloud}
                title={showAuthForm ? 'Cancelar' : 'Conectar conta'}
                sub={showAuthForm ? '' : 'Sync entre dispositivos'}
                onClick={() => setShowAuthForm(!showAuthForm)}
              />

              {showAuthForm && (
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-flame/20 bg-flame/5 animate-fade-up">
                  <div className="flex gap-2 font-mono text-[10px]">
                    <button
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-1.5 rounded-lg border transition-colors ${authMode === 'login' ? 'border-flame text-flame' : 'border-[var(--color-border)] text-faint'}`}
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-1.5 rounded-lg border transition-colors ${authMode === 'register' ? 'border-flame text-flame' : 'border-[var(--color-border)] text-faint'}`}
                    >
                      Criar conta
                    </button>
                  </div>

                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Senha (min. 8 caracteres)"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                  />

                  <Button
                    variant="flame"
                    size="sm"
                    onClick={handleAuth}
                    disabled={authLoading || !authEmail || authPassword.length < 8}
                  >
                    {authLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : authMode === 'login' ? (
                      <>
                        <Cloud className="w-3.5 h-3.5" /> Entrar
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" /> Criar conta
                      </>
                    )}
                  </Button>

                  <p className="font-mono text-[9px] text-faint">
                    O vault permanece criptografado — o servidor nunca vê suas orações.
                  </p>
                </div>
              )}
            </>
          )}

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
