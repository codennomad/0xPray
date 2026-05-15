import { create } from 'zustand'
import { saveVault } from '@/lib/storage'
import type { Prayer, Vault, AppLockState, VaultSettings } from '@/types'
import { generateId } from '@/lib/utils'

interface VaultState {
  lockState: AppLockState
  key: CryptoKey | null
  vault: Vault | null

  unlock: (key: CryptoKey, vault: Vault) => void
  lock: () => void
  setKey: (key: CryptoKey) => void

  addPrayer: (data: Omit<Prayer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePrayer: (id: string, patch: Partial<Omit<Prayer, 'id' | 'createdAt'>>) => Promise<void>
  deletePrayer: (id: string) => Promise<void>
  updateSettings: (patch: Partial<VaultSettings>) => Promise<void>
}

export const useVault = create<VaultState>((set, get) => ({
  lockState: 'locked',
  key: null,
  vault: null,

  unlock: (key, vault) => set({ lockState: 'unlocked', key, vault }),
  lock: () => set({ lockState: 'locked', key: null, vault: null }),
  setKey: (key) => set({ key }),

  addPrayer: async (data) => {
    const { key, vault } = get()
    if (!key || !vault) return
    const prayer: Prayer = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const next: Vault = { ...vault, prayers: [prayer, ...vault.prayers] }
    set({ vault: next })
    await saveVault(key, next)
  },

  updatePrayer: async (id, patch) => {
    const { key, vault } = get()
    if (!key || !vault) return
    const prayers = vault.prayers.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
    )
    const next: Vault = { ...vault, prayers }
    set({ vault: next })
    await saveVault(key, next)
  },

  deletePrayer: async (id) => {
    const { key, vault } = get()
    if (!key || !vault) return
    const next: Vault = { ...vault, prayers: vault.prayers.filter((p) => p.id !== id) }
    set({ vault: next })
    await saveVault(key, next)
  },

  updateSettings: async (patch) => {
    const { key, vault } = get()
    if (!key || !vault) return
    const next: Vault = { ...vault, settings: { ...vault.settings, ...patch } }
    set({ vault: next })
    await saveVault(key, next)
  },
}))
