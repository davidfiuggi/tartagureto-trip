export interface BudgetOption {
  id: string
  label: string
  icon: string
  description: string
}

export interface WeekendType {
  id: string
  name: string
  days: string[]
  duration: string
  icon: string
  description: string
}

export interface MonthOption {
  id: string
  name: string
  shortName: string
}

export const budgetOptions: BudgetOption[] = [
  { id: 'budget1', label: '50-100€', icon: '💰', description: 'Economico' },
  { id: 'budget2', label: '100-150€', icon: '💰💰', description: 'Medio' },
  { id: 'budget3', label: '150-200€', icon: '💰💰💰', description: 'Comfort' },
  { id: 'budget4', label: '200€+', icon: '💎', description: 'Premium' },
]

export const weekendTypes: WeekendType[] = [
  {
    id: 'short',
    name: 'Weekend',
    days: ['Sabato', 'Domenica'],
    duration: '2 giorni',
    icon: '⚡',
    description: 'Mordi e fuggi',
  },
  {
    id: 'long',
    name: 'Weekend Lungo',
    days: ['Venerdì', 'Sabato', 'Domenica'],
    duration: '3 giorni',
    icon: '🌴',
    description: 'Il classico',
  },
  {
    id: 'extended',
    name: 'Weekend Lunghissimo',
    days: ['Venerdì', 'Sabato', 'Domenica', 'Lunedì'],
    duration: '4 giorni',
    icon: '🏝️',
    description: 'Vacanza vera',
  },
]

export const availableMonths: MonthOption[] = [
  { id: 'june', name: 'Giugno', shortName: 'Giu' },
  { id: 'july', name: 'Luglio', shortName: 'Lug' },
  { id: 'august', name: 'Agosto', shortName: 'Ago' },
  { id: 'september', name: 'Settembre', shortName: 'Set' },
]
