'use client'

import { Vote, Member } from '@/lib/types'
import { destinations } from '@/lib/destinations-data'
import { budgetOptions, weekendTypes, availableMonths } from '@/lib/voting-options'
import { Trash2, Vote as VoteIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  votes: Vote[]
  members: Member[]
  onReload: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  destination: 'Destinazioni',
  budget: 'Budget',
  weekend_type: 'Weekend',
  month: 'Mese',
}

function getOptionLabel(category: string, optionId: string): string {
  if (category === 'destination') {
    return destinations.find(d => d.id === optionId)?.name || optionId
  }
  if (category === 'budget') {
    return budgetOptions.find(b => b.id === optionId)?.label || optionId
  }
  if (category === 'weekend_type') {
    const wt = weekendTypes.find(w => w.id === optionId)
    return wt ? `${wt.icon} ${wt.name}` : optionId
  }
  if (category === 'month') {
    return availableMonths.find(m => m.id === optionId)?.name || optionId
  }
  return optionId
}

export default function AdminVotes({ votes, members, onReload }: Props) {
  async function deleteVote(voteId: string) {
    await supabase.from('votes').delete().eq('id', voteId)
    onReload()
  }

  async function deleteAllVotesForCategory(category: string) {
    if (!confirm(`Eliminare tutti i voti per "${CATEGORY_LABELS[category] || category}"?`)) return
    const ids = votes.filter(v => v.category === category).map(v => v.id)
    if (ids.length === 0) return
    await supabase.from('votes').delete().in('id', ids)
    onReload()
  }

  // Group votes by category
  const categories = ['destination', 'budget', 'weekend_type', 'month'] as const
  const grouped = categories.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    votes: votes.filter(v => v.category === cat),
  }))

  if (votes.length === 0) {
    return (
      <section className="animate-fade-up" style={{ animationDelay: '0.12s', opacity: 0 }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
          <VoteIcon size={12} className="inline mr-1" /> Gestione Voti
        </h2>
        <div className="rounded-xl p-4 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs italic" style={{ color: 'var(--muted-light)' }}>
            Nessun voto registrato
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-up" style={{ animationDelay: '0.12s', opacity: 0 }}>
      <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
        <VoteIcon size={12} className="inline mr-1" /> Gestione Voti ({votes.length} totali)
      </h2>
      <div className="space-y-4">
        {grouped.map(g => {
          if (g.votes.length === 0) return null
          return (
            <div key={g.category}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                  {g.label} ({g.votes.length})
                </p>
                <button onClick={() => deleteAllVotesForCategory(g.category)}
                  className="text-[10px] font-medium px-2 py-1 rounded-lg transition hover:bg-red-50"
                  style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}>
                  Elimina tutti
                </button>
              </div>
              <div className="space-y-1">
                {g.votes.map(v => {
                  const memberName = members.find(m => m.id === v.member_id)?.name || '?'
                  const optionLabel = getOptionLabel(v.category, v.option_id)
                  return (
                    <div key={v.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {memberName}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--muted)' }}>→</span>
                        <span className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                          {optionLabel}
                        </span>
                      </div>
                      <button onClick={() => deleteVote(v.id)}
                        className="p-1.5 rounded-lg transition hover:bg-red-50 flex-shrink-0"
                        style={{ color: 'var(--accent)' }} title="Elimina voto">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
