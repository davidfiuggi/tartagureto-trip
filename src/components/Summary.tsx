'use client'

import { ProposalWithVotes } from '@/lib/types'
import { PROPOSAL_LABELS } from '@/lib/utils'

interface Props {
  proposals: ProposalWithVotes[]
}

export default function Summary({ proposals }: Props) {
  const types = ['destination', 'date', 'budget', 'activity'] as const

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🏆</span>
        <h2 className="text-base font-bold">Current Winners</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {types.map(type => {
          const items = proposals.filter(p => p.type === type).sort((a, b) => b.score - a.score)
          const winner = items[0]
          const label = PROPOSAL_LABELS[type]

          return (
            <div key={type} className="glass rounded-2xl p-4 relative overflow-hidden">
              {winner && winner.score > 0 && (
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute top-1 right-1 text-gold text-xs">&#9733;</div>
                </div>
              )}
              <p className="text-xs text-muted mb-1">{label.emoji} {label.label}</p>
              {winner ? (
                <>
                  <p className="font-bold text-sm truncate">{winner.title}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-xs font-bold ${winner.score > 0 ? 'text-green' : winner.score < 0 ? 'text-pink' : 'text-muted'}`}>
                      {winner.score > 0 ? '+' : ''}{winner.score}
                    </span>
                    <span className="text-xs text-muted">votes</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted italic mt-1">No proposals yet</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
