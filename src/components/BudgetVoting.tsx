'use client'

import { budgetOptions } from '@/lib/voting-options'
import { Vote, Member } from '@/lib/types'

interface Props {
  votes: Vote[]
  members: Member[]
  memberId: string
  onToggle: (optionId: string) => void
}

export default function BudgetVoting({ votes, members, memberId, onToggle }: Props) {
  const budgetVotes = votes.filter(v => v.category === 'budget')

  function getVoters(optionId: string): string[] {
    return budgetVotes
      .filter(v => v.option_id === optionId)
      .map(v => members.find(m => m.id === v.member_id)?.name || '?')
  }

  function hasVoted(optionId: string): boolean {
    return budgetVotes.some(v => v.option_id === optionId && v.member_id === memberId)
  }

  // Find leading option
  let bestId = ''
  let bestCount = 0
  budgetOptions.forEach(opt => {
    const count = budgetVotes.filter(v => v.option_id === opt.id).length
    if (count > bestCount) {
      bestCount = count
      bestId = opt.id
    }
  })

  return (
    <div className="space-y-4">
      <div className="text-center mb-2 animate-fade-up">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
          Quanto spendiamo?
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Vota il budget a notte che preferisci
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {budgetOptions.map((opt, i) => {
          const voted = hasVoted(opt.id)
          const voters = getVoters(opt.id)

          return (
            <button
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className="rounded-2xl p-4 text-left transition-all active:scale-[0.97] animate-fade-up"
              style={{
                background: voted ? 'var(--green-light)' : 'var(--card)',
                border: voted ? '2px solid var(--green)' : '1px solid var(--border)',
                boxShadow: voted ? '0 4px 12px rgba(46, 204, 113, 0.15)' : 'var(--shadow-sm)',
                animationDelay: `${i * 0.06}s`,
                opacity: 0,
              }}
            >
              <div className="text-2xl mb-2">{opt.icon}</div>
              <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                {opt.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {opt.description}
              </p>
              {voters.length > 0 && (
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--green)' }}>
                    {voters.length} 👍
                  </span>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                    {voters.join(', ')}
                  </p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Trend */}
      {bestCount > 0 && (
        <div
          className="rounded-xl p-3.5 text-center animate-fade-up"
          style={{ background: 'var(--green-light)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
            📊 Tendenza: {budgetOptions.find(o => o.id === bestId)?.label} a notte ({bestCount}{' '}
            {bestCount === 1 ? 'voto' : 'voti'})
          </p>
        </div>
      )}
    </div>
  )
}
