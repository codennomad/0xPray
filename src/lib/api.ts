import type { VaultMeta } from '@/types'

const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('0xpray_token')
}

export function setToken(token: string): void {
  localStorage.setItem('0xpray_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('0xpray_token')
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface AuthUser {
  id: string
  email: string
}

export async function register(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  return req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  return req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function logout(): Promise<void> {
  await req('/auth/logout', { method: 'POST' }).catch(() => {})
  clearToken()
}

export async function getMe(): Promise<AuthUser> {
  return req('/auth/me')
}

// Push local encrypted vault to server.
// encrypted_data = JSON.stringify({iv, ct}) — server never sees plaintext.
export async function pushVault(meta: VaultMeta, version: number): Promise<void> {
  await req('/vault', {
    method: 'PUT',
    body: JSON.stringify({
      encrypted_data: JSON.stringify({ iv: meta.iv, ct: meta.ct }),
      salt: meta.salt,
      client_version: version,
    }),
  })
}

// Pull encrypted vault from server and reconstruct VaultMeta.
export async function pullVault(): Promise<{ meta: VaultMeta; version: number } | null> {
  try {
    const data = await req<{ encrypted_data: string; salt: string; client_version: number }>('/vault')
    const { iv, ct } = JSON.parse(data.encrypted_data) as { iv: string; ct: string }
    return { meta: { salt: data.salt, iv, ct }, version: data.client_version }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('404')) return null
    throw e
  }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
