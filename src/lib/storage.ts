import { deriveKey, encrypt, decrypt, randomSalt, b64dec } from './crypto'
import type { Vault, VaultMeta } from '@/types'

const VAULT_KEY = '0xpray_v2'

export const DEFAULT_VAULT: Vault = {
  prayers: [],
  settings: {
    aiModel: 'claude-haiku-4-5-20251001',
    focusFont: 'jakarta',
  },
}

export function vaultExists(): boolean {
  return !!localStorage.getItem(VAULT_KEY)
}

export function loadMeta(): VaultMeta | null {
  try {
    return JSON.parse(localStorage.getItem(VAULT_KEY) ?? 'null') as VaultMeta | null
  } catch {
    return null
  }
}

export async function initVault(pin: string): Promise<CryptoKey> {
  const salt = randomSalt()
  const key = await deriveKey(pin, b64dec(salt))
  const { iv, ct } = await encrypt(key, JSON.stringify(DEFAULT_VAULT))
  localStorage.setItem(VAULT_KEY, JSON.stringify({ salt, iv, ct }))
  return key
}

export async function openVault(pin: string): Promise<{ key: CryptoKey; vault: Vault }> {
  const meta = loadMeta()
  if (!meta) throw new Error('Vault not found')
  const key = await deriveKey(pin, b64dec(meta.salt))
  const plain = await decrypt(key, meta.iv, meta.ct)
  const vault = JSON.parse(plain) as Vault
  return { key, vault }
}

export async function saveVault(key: CryptoKey, vault: Vault): Promise<void> {
  const meta = loadMeta()
  if (!meta) throw new Error('No vault meta')
  const { iv, ct } = await encrypt(key, JSON.stringify(vault))
  localStorage.setItem(VAULT_KEY, JSON.stringify({ salt: meta.salt, iv, ct }))
}

export async function reencryptVault(
  _oldKey: CryptoKey,
  newPin: string,
  vault: Vault
): Promise<CryptoKey> {
  const salt = randomSalt()
  const newKey = await deriveKey(newPin, b64dec(salt))
  const { iv, ct } = await encrypt(newKey, JSON.stringify(vault))
  localStorage.setItem(VAULT_KEY, JSON.stringify({ salt, iv, ct }))
  return newKey
}

export function destroyVault(): void {
  localStorage.removeItem(VAULT_KEY)
}

export function exportPlain(vault: Vault): string {
  return JSON.stringify({ version: 2, vault, exportedAt: new Date().toISOString() }, null, 2)
}
