const enc = new TextEncoder()
const dec = new TextDecoder()

export const b64enc = (buf: ArrayBuffer | Uint8Array): string =>
  btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf)))

export const b64dec = (s: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>

export async function deriveKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const km = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 210_000, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encrypt(
  key: CryptoKey,
  plaintext: string
): Promise<{ iv: string; ct: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
  return { iv: b64enc(iv), ct: b64enc(ct) }
}

export async function decrypt(key: CryptoKey, iv64: string, ct64: string): Promise<string> {
  const raw = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64dec(iv64) },
    key,
    b64dec(ct64)
  )
  return dec.decode(raw)
}

export function randomSalt(): string {
  return b64enc(crypto.getRandomValues(new Uint8Array(16)))
}
