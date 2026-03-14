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
      trip_id: tripId,
      member_id: memberId,
      type,
      title: title.trim(),
      description: desc.trim() || null,
    })
    setTitle('')
    setDesc('')
    setOpen(false)
    setLoading(false)
    onAdded()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl border border-dashed border-border text-muted text-sm hover:border-accent hover:text-accent transition"
      >
        + Add proposal
      </button>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
        className="w-full py-2 px-3 rounded-lg bg-background border border-border text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent"
      />
      <input
        placeholder="Description (optional)"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        className="w-full py-2 px-3 rounded-lg bg-background border border-border text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="py-2 px-4 rounded-lg text-muted text-sm hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
