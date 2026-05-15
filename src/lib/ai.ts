import type { PrayerCategory } from '@/types'

export interface GenerateRequest {
  category: PrayerCategory
  intention: string
  length: 'short' | 'medium' | 'long'
  model: string
}

const LENGTH_MAP = {
  short: 'curta (2-3 frases, direta e profunda)',
  medium: 'média (1 parágrafo, contemplativa)',
  long: 'longa (2-3 parágrafos, detalhada e poética)',
}

const CAT_CONTEXT: Record<PrayerCategory, string> = {
  MANHÃ: 'matinal — gratidão pelo novo dia, pedido de guia e presença divina',
  NOITE: 'noturna — gratidão pelo dia vivido, pedido de proteção e paz no sono',
  INTERCESSÃO: 'de intercessão — orar por alguém ou situação específica com compaixão',
  GRATIDÃO: 'de gratidão e louvor — celebrar as bênçãos e a bondade divina',
  ARREPENDIMENTO: 'de arrependimento — humildade, confissão e busca por perdão e restauração',
  PESSOAL: 'pessoal e íntima — conversa sincera com Deus sobre a vida interior',
  CLAMOR: 'de clamor urgente — oração em momento de necessidade ou angústia profunda',
}

export async function generatePrayer(apiKey: string, req: GenerateRequest): Promise<string> {
  const system = `Você é um assistente espiritual que escreve orações cristãs em português brasileiro.
Escreva apenas o texto da oração — sem título, sem prefácio, sem explicações.
A oração deve ser pessoal (primeira pessoa), sincera, profunda e poética.
Use linguagem contemporânea mas reverente.`

  const user = `Escreva uma oração ${CAT_CONTEXT[req.category]}.
${req.intention ? `Intenção: ${req.intention}` : ''}
Comprimento: ${LENGTH_MAP[req.length]}.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    throw new Error(err?.error?.message ?? `API ${res.status}`)
  }

  const data = (await res.json()) as { content: Array<{ type: string; text: string }> }
  return data.content.find((c) => c.type === 'text')?.text?.trim() ?? ''
}
