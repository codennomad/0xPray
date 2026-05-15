export type PrayerCategory =
  | 'MANHÃ'
  | 'NOITE'
  | 'INTERCESSÃO'
  | 'GRATIDÃO'
  | 'ARREPENDIMENTO'
  | 'PESSOAL'
  | 'CLAMOR'

export interface Prayer {
  id: string
  title: string
  body: string
  category: PrayerCategory
  answered: boolean
  answeredAt?: string
  aiGenerated: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface VaultSettings {
  aiModel: 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6'
  focusFont: 'jakarta' | 'mono' | 'display'
  apiKeyEncrypted?: string
  apiKeyIv?: string
}

export interface Vault {
  prayers: Prayer[]
  settings: VaultSettings
}

export interface VaultMeta {
  salt: string
  iv: string
  ct: string
}

export type AppLockState = 'locked' | 'unlocked' | 'setup'
