'use client'

import { weekendTypes, availableMonths } from '@/lib/voting-options'
import { Vote, Member } from '@/lib/types'

interface Props {
  votes: Vote[]
  members: Member[]
  memberId: string
  onToggleWeekend: (optionId: string) => void
  onToggleMonth: (optionId: string) => void
}

export default function WhenVoting({ votes, members, memberId, onToggleWeekend, onToggleMonth }: Props) {
  const weekendVotes = votes.filter(v => v.category === 'weekend_type')
  const monthVotes = votes.filter(v => v.category === 'month')

  function getVoters(category: string, optionId: string): string[] {
    return votes
      .filter(v => v.category === category && v.option_id === optionId)
      .map(v => members.find(m => m.id === v.member_id)?.name || '?')
  }

  function hasVoted(category: string, optionId: string): boolean {
    return votes.some(v => v.category === category && v.option_id === optionId && v.member_id === memberId)
  }

  // Best weekend type
  let bestWeekend = ''
  let bestWeekendCount = 0
  weekendTypes.forEach(t => {
    const count = weekendVotes.filter(v => v.option_id === t.id).length
    if (count > bestWeekendCount) { bestWeekendCount = count; bestWeekend = t.id }
  })

  // Best month
  let bestMonth = ''
  let bestMonthCount = 0
  availableMonths.forEach(m => {
    const count = monthVotes.filter(v => v.option_id === m.id).length
    if (count > bestMonthCount) { bestMonthCount = count; bestMonth = m.id }
  })

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-up">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Quando andiamo?</h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Scegli tipo di weekend e mese preferito</p>
      </div>

      {/* Weekend Types */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
          Tipo di Weekend
        </h3>
        <div className="space-y-2">
          {weekendTypes.map((type, i) => {
            const voted = hasVoted('weekend_type', type.id)
            const voters = getVoters('weekend_type', type.id)
            return (
              <button key={type.id} onClick={() => onToggleWeekend(type.id)}
                className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98] animate-fade-up"
                style={{
                  background: voted ? 'var(--blue-light)' : 'var(--card)',
                  border: voted ? '2px solid var(--blue)' : '1px solid var(--border)',
                  boxShadow: voted ? '0 4px 12px rgba(74, 144, 217, 0.15)' : 'var(--shadow-sm)',
                  animationDelay: `${i * 0.06}s`, opacity: 0,
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{type.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {type.duration} — {type.days.join(' + ')}
                      </p>
                    </div>
                  </div>
                  {voters.length > 0 && (
                    <div className="text-right">
                      <span className="text-xs font-semibold" style={{ color: 'var(--blue)' }}>
                        {voters.length} 👍
                      </span>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                        {voters.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Months */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
          Mese Preferito
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {availableMonths.map((month, i) => {
            const voted = hasVoted('month', month.id)
            const voters = getVoters('month', month.id)
            return (
              <button key={month.id} onClick={() => onToggleMonth(month.id)}
                className="rounded-2xl p-4 text-center transition-all active:scale-[0.97] animate-fade-up"
                style={{
                  background: voted ? 'var(--orange-light)' : 'var(--card)',
                  border: voted ? '2px solid var(--orange)' : '1px solid var(--border)',
                  boxShadow: voted ? '0 4px 12px rgba(243, 156, 18, 0.15)' : 'var(--shadow-sm)',
                  animationDelay: `${i * 0.06}s`, opacity: 0,
                }}>
                <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{month.name}</p>
                {voters.length > 0 && (
                  <div className="mt-1.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--orange)' }}>
                      {voters.length} 👍
                    </span>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                      {voters.join(', ')}
                    </p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Trends */}
      {(bestWeekendCount > 0 || bestMonthCount > 0) && (
        <div className="rounded-xl p-3.5 text-center animate-fade-up"
          style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--blue)' }}>
            📊 Tendenze:
            {bestWeekendCount > 0 && ` ${weekendTypes.find(t => t.id === bestWeekend)?.name} (${bestWeekendCount} ${bestWeekendCount === 1 ? 'voto' : 'voti'})`}
            {bestWeekendCount > 0 && bestMonthCount > 0 && ' · '}
            {bestMonthCount > 0 && ` ${availableMonths.find(m => m.id === bestMonth)?.name} (${bestMonthCount} ${bestMonthCount === 1 ? 'voto' : 'voti'})`}
          </p>
        </div>
      )}
    </div>
  )
}
