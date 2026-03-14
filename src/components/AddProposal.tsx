'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProposalType } from '@/lib/types'

interface Props {
  tripId: string
  memberId: string
  type: ProposalType
  onAdded: () => void
}

export default function AddProposal({ tripId, memberId, type, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return
    setLoading(true)
    await supabase.from('proposals').insert({
      trip_id: tripId, member_id: memberId, type,
      title: title.trim(), description: desc.trim() || null,
    })
    setTitle(''); setDesc(''); setOpen(false); setLoading(false)
    onAdded()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-muted text-sm hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all duration-300">
        + Add proposal
      </button>
    )
  }

  return (
    <div className="glass rounded-2xl p-4 space-y-3 animate-fade-up">
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} autoFocus
        className="w-full py-2.5 px-3.5 rounded-xl input-glass text-white text-sm placeholder:text-muted"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
      <input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)}
        className="w-full py-2.5 px-3.5 rounded-xl input-glass text-white text-sm placeholder:text-muted" />
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-2.5 rounded-xl btn-glow text-white text-sm font-semibold disabled:opacity-50">
          {loading ? 'Adding...' : 'Add'}
        </button>
        <button onClick={() => setOpen(false)}
          className="py-2.5 px-4 rounded-xl text-muted text-sm hover:text-white transition">Cancel</button>
      </div>
    </div>
  )
}
