'use client'

import { useState } from 'react'
import { ProposalWithVotes } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { ChevronUp, ChevronDown, Trophy } from 'lucide-react'

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
    setTimeout(() => setAnimating(null), 250)
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
    <div className="rounded-2xl p-4 animate-slide-in transition-all"
      style={{
        background: isWinner ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' : 'var(--card)',
        border: isWinner ? '1.5px solid #F59E0B' : '1px solid var(--border)',
        boxShadow: isWinner ? '0 4px 16px rgba(245, 158, 11, 0.1)' : 'var(--shadow-sm)',
        animationDelay: `${rank * 0.05}s`, opacity: 0,
      }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isWinner && <Trophy size={14} style={{ color: '#F59E0B' }} />}
            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{proposal.title}</p>
          </div>
          {proposal.description && (
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{proposal.description}</p>
          )}
          <p className="text-xs mt-2" style={{ color: 'var(--muted-light)' }}>by {proposal.member_name}</p>
        </div>

        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <button onClick={() => handleVote(1)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${animating === 'up' ? 'animate-vote-pop' : ''}`}
            style={{
              background: myVote?.vote === 1 ? 'var(--green-light)' : 'var(--background)',
              border: myVote?.vote === 1 ? '1.5px solid var(--green)' : '1px solid var(--border)',
              color: myVote?.vote === 1 ? 'var(--green)' : 'var(--muted)',
            }}>
            <ChevronUp size={16} />
          </button>

          <span className="text-sm font-bold py-1" style={{
            color: proposal.score > 0 ? 'var(--green)' : proposal.score < 0 ? 'var(--accent)' : 'var(--muted)',
          }}>
            {proposal.score}
          </span>

          <button onClick={() => handleVote(-1)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${animating === 'down' ? 'animate-vote-pop' : ''}`}
            style={{
              background: myVote?.vote === -1 ? 'var(--accent-light)' : 'var(--background)',
              border: myVote?.vote === -1 ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              color: myVote?.vote === -1 ? 'var(--accent)' : 'var(--muted)',
            }}>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
      {(upCount > 0 || downCount > 0) && (
        <div className="flex gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          {upCount > 0 && <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>{upCount} upvote{upCount !== 1 ? 's' : ''}</span>}
          {downCount > 0 && <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{downCount} downvote{downCount !== 1 ? 's' : ''}</span>}
        </div>
      )}
    </div>
  )
}
