'use client'

import { ProposalWithVotes } from '@/lib/types'
import { MapPin, Calendar, Wallet, Sparkles, Trophy } from 'lucide-react'

const TYPE_CONFIG = {
  destination: { icon: MapPin, label: 'Destination', color: 'var(--accent)', bg: 'var(--accent-light)' },
  date: { icon: Calendar, label: 'Date', color: 'var(--blue)', bg: 'var(--blue-light)' },
  budget: { icon: Wallet, label: 'Budget', color: 'var(--green)', bg: 'var(--green-light)' },
  activity: { icon: Sparkles, label: 'Activity', color: 'var(--purple)', bg: 'var(--purple-light)' },
} as const

interface Props {
  proposals: ProposalWithVotes[]
}

export default function Summary({ proposals }: Props) {
  const types = ['destination', 'date', 'budget', 'activity'] as const

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-2 gap-3">
        {types.map(type => {
          const items = proposals.filter(p => p.type === type).sort((a, b) => b.score - a.score)
          const winner = items[0]
          const config = TYPE_CONFIG[type]
          const Icon = config.icon

          return (
            <div key={type} className="rounded-2xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: config.bg }}>
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{config.label}</span>
              </div>
              {winner ? (
                <>
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>{winner.title}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {winner.score > 0 && <Trophy size={11} style={{ color: 'var(--orange)' }} />}
                    <span className="text-xs font-semibold" style={{
                      color: winner.score > 0 ? 'var(--green)' : winner.score < 0 ? 'var(--accent)' : 'var(--muted)',
                    }}>
                      {winner.score > 0 ? '+' : ''}{winner.score} votes
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs italic" style={{ color: 'var(--muted-light)' }}>No proposals yet</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
