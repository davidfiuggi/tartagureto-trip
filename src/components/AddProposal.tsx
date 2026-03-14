'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProposalType } from '@/lib/types'
import { Plus, Send, X } from 'lucide-react'

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
        className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-50 active:scale-[0.99]"
        style={{ border: '1.5px dashed var(--border)', color: 'var(--muted)' }}>
        <Plus size={16} /> Add a proposal
      </button>
    )
  }

  return (
    <div className="rounded-2xl p-4 animate-scale-in"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>New proposal</p>
        <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition">
          <X size={16} style={{ color: 'var(--muted)' }} />
        </button>
      </div>
      <div className="space-y-2.5">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} autoFocus
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full py-2.5 px-3.5 rounded-xl text-sm focus:outline-none transition-all"
          style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        <input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)}
          className="w-full py-2.5 px-3.5 rounded-xl text-sm focus:outline-none transition-all"
          style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>
      <button onClick={handleSubmit} disabled={loading}
        className="w-full mt-3 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: 'var(--accent)' }}>
        {loading ? 'Adding...' : <><Send size={14} /> Submit</>}
      </button>
    </div>
  )
}
