import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PrayerCategory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  return `${days}d atrás`
}

export const CATEGORIES: PrayerCategory[] = [
  'MANHÃ',
  'NOITE',
  'INTERCESSÃO',
  'GRATIDÃO',
  'ARREPENDIMENTO',
  'PESSOAL',
  'CLAMOR',
]

export const CATEGORY_LABEL: Record<PrayerCategory, string> = {
  MANHÃ: 'Manhã',
  NOITE: 'Noite',
  INTERCESSÃO: 'Intercessão',
  GRATIDÃO: 'Gratidão',
  ARREPENDIMENTO: 'Arrependimento',
  PESSOAL: 'Pessoal',
  CLAMOR: 'Clamor',
}

export const CATEGORY_GLYPH: Record<PrayerCategory, string> = {
  MANHÃ: '☀',
  NOITE: '☽',
  INTERCESSÃO: '✝',
  GRATIDÃO: '♥',
  ARREPENDIMENTO: '◈',
  PESSOAL: '◎',
  CLAMOR: '◬',
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function calcStreak(prayers: { createdAt: string }[]): number {
  if (!prayers.length) return 0
  const days = [...new Set(prayers.map((p) => p.createdAt.slice(0, 10)))].sort().reverse()
  let streak = 0
  let cur = new Date()
  cur.setHours(0, 0, 0, 0)
  for (const d of days) {
    const day = new Date(d + 'T00:00:00')
    if ((cur.getTime() - day.getTime()) / 86_400_000 <= streak + 1) {
      streak++
      cur = day
    } else break
  }
  return streak
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…'
}
