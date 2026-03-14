'use client'

import { ProposalWithVotes } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface Props {
  proposal: ProposalWithVotes
  memberId: string
  onVoted: () => void
}

export default function ProposalCard({ proposal, memberId, onVoted }: Props) {
  const myVote = proposal.votes.find(v => v.member_id === memberId)
  const upCount = proposal.votes.filter(v => v.vote === 1).length
  const downCount = proposal.votes.filter(v => v.vote === -1).length

  async function handleVote(vote: 1 | -1) {
    if (myVote?.vote === vote) {
      // Remove vote
      await supabase.from('votes').delete().eq('id', myVote.id)
    } else if (myVote) {
      // Change vote
      await supabase.from('votes').update({ vote }).eq('id', myVote.id)
    } else {
      // New vote
      await supabase.from('votes').insert({ proposal_id: proposal.id, member_id: memberId, vote })
    }
    onVoted()
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{proposal.title}</p>
          {proposal.description && (
            <p className="text-muted text-xs mt-1">{proposal.description}</p>
          )}
          <p className="text-muted text-xs mt-2">by {proposal.member_name}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => handleVote(1)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition ${
              myVote?.vote === 1
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-background border border-border text-muted hover:text-green-400'
            }`}
          >
            {upCount > 0 ? upCount : '▲'}
          </button>
          <span className="text-sm font-bold w-8 text-center">{proposal.score}</span>
          <button
            onClick={() => handleVote(-1)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition ${
              myVote?.vote === -1
                ? 'bg-pink/20 text-pink border border-pink/30'
                : 'bg-background border border-border text-muted hover:text-pink'
            }`}
          >
            {downCount > 0 ? downCount : '▼'}
          </button>
        </div>
      </div>
    </div>
  )
}
