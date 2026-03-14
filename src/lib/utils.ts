const AVATAR_COLORS = [
  '#FF6B6B', '#4A90D9', '#2ECC71', '#F39C12',
  '#9B59B6', '#E17055', '#00B894', '#6C5CE7',
]

export function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function getSession(code: string): { memberId: string; memberName: string } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(`trip_${code}`)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setSession(code: string, memberId: string, memberName: string) {
  localStorage.setItem(`trip_${code}`, JSON.stringify({ memberId, memberName }))
}

export function clearSession(code: string) {
  localStorage.removeItem(`trip_${code}`)
}

export const PROPOSAL_LABELS: Record<string, { label: string; emoji: string }> = {
  destination: { label: 'Destinations', emoji: '📍' },
  date: { label: 'Dates', emoji: '📅' },
  budget: { label: 'Budget', emoji: '💰' },
  activity: { label: 'Activities', emoji: '🎯' },
}
