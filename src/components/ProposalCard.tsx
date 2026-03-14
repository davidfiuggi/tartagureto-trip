'use client'

import { useState } from 'react'
import { ProposalWithVotes } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface Props {
  proposal: ProposalWithVotes
  memberId: string
  onVoted: () => void
  rank: number
}

export default function ProposalCard({ proposal, memberId, onVoted, rank }: Props) {
  const [animating, setAnimating] = useState<'up' | 'down' | null>(null)
  const myVote = proposal.votes.find(v => v.member_id === memberId)
  const upCount = proposal.votes.filter(v => v.vote === 1).length
  const downCount = proposal.votes.filter(v => v.vote === -1).length
  const isWinner = rank === 0 && proposal.score > 0

  async function handleVote(vote: 1 | -1) {
    setAnimating(vote === 1 ? 'up' : 'down')
    setTimeout(() => setAnimating(null), 300)

    if (myVote?.vote === vote) {
      await supabase.from('votes').delete().eq('id', myVote.id)
    } else if (myVote) {
      await supabase.from('votes').update({ vote }).eq('id', myVote.id)
    } else {
      await supabase.from('votes').insert({ proposal_id: proposal.id, member_id: memberId, vote })
    }
    onVoted()
  }

  return (
    <div className={`glass rounded-2xl p-4 animate-slide-in transition-all duration-300 ${
      isWinner ? 'winner-badge' : ''
    }`} style={{ animationDelay: `${rank * 0.05}s`, opacity: 0 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isWinner && <span className="text-gold text-sm">&#9733;</span>}
            <p className="font-semibold text-sm">{proposal.title}</p>
          </div>
          {proposal.description && (
            <p className="text-muted text-xs mt-1.5 leading-relaxed">{proposal.description}</p>
          )}
          <p className="text-muted/60 text-xs mt-2">by {proposal.member_name}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Upvote */}
          <button onClick={() => handleVote(1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
              myVote?.vote === 1 ? 'vote-up-active' : 'glass text-muted hover:text-green'
            } ${animating === 'up' ? 'animate-vote-pop' : ''}`}>
            {upCount > 0 ? upCount : '▲'}
          </button>

          {/* Score */}
          <span className={`text-sm font-bold w-8 text-center transition-colors ${
            proposal.score > 0 ? 'text-green' : proposal.score < 0 ? 'text-pink' : 'text-muted'
          }`}>
            {proposal.score > 0 ? `+${proposal.score}` : proposal.score}
          </span>

          {/* Downvote */}
          <button onClick={() => handleVote(-1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
              myVote?.vote === -1 ? 'vote-down-active' : 'glass text-muted hover:text-pink'
            } ${animating === 'down' ? 'animate-vote-pop' : ''}`}>
            {downCount > 0 ? downCount : '▼'}
          </button>
        </div>
      </div>
    </div>
  )
}
