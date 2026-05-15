import { describe, it, expect } from 'vitest'
import { deriveKey, encrypt, decrypt, randomSalt, b64dec } from './crypto'

describe('crypto', () => {
  it('derives a consistent key from the same pin + salt', async () => {
    const salt = b64dec(randomSalt())
    const k1 = await deriveKey('1234', salt)
    const k2 = await deriveKey('1234', salt)
    // Same params produce equivalent keys — verify via encrypt/decrypt
    const { iv, ct } = await encrypt(k1, 'test')
    const plain = await decrypt(k2, iv, ct)
    expect(plain).toBe('test')
  })

  it('encrypts and decrypts correctly', async () => {
    const key = await deriveKey('securepin', b64dec(randomSalt()))
    const msg = 'Senhor, que esta oração chegue até Ti.'
    const { iv, ct } = await encrypt(key, msg)
    const result = await decrypt(key, iv, ct)
    expect(result).toBe(msg)
  })

  it('produces different ciphertext each call (random IV)', async () => {
    const key = await deriveKey('1234', b64dec(randomSalt()))
    const { ct: ct1 } = await encrypt(key, 'same')
    const { ct: ct2 } = await encrypt(key, 'same')
    expect(ct1).not.toBe(ct2)
  })

  it('throws on wrong key', async () => {
    const salt = b64dec(randomSalt())
    const k1 = await deriveKey('correct', salt)
    const k2 = await deriveKey('wrong', salt)
    const { iv, ct } = await encrypt(k1, 'secret')
    await expect(decrypt(k2, iv, ct)).rejects.toThrow()
  })

  it('throws on tampered ciphertext', async () => {
    const key = await deriveKey('1234', b64dec(randomSalt()))
    const { iv, ct } = await encrypt(key, 'data')
    const tampered = ct.slice(0, -4) + 'XXXX'
    await expect(decrypt(key, iv, tampered)).rejects.toThrow()
  })
})
