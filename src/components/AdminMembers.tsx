'use client'

import { Member } from '@/lib/types'
import { Trash2, Crown, Plus, GitMerge } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  members: Member[]
  tripId: string
  onReload: () => void
}

export default function AdminMembers({ members, tripId, onReload }: Props) {
  const [newMember, setNewMember] = useState('')
  const [mergeFrom, setMergeFrom] = useState<string | null>(null)
  const [mergeTo, setMergeTo] = useState<string>('')

  async function addMember() {
    if (!newMember.trim()) return
    const colors = ['#FF6B6B', '#4A90D9', '#2ECC71', '#F39C12', '#9B59B6', '#E17055']
    await supabase.from('members').insert({
      trip_id: tripId, name: newMember.trim(),
      avatar_color: colors[Math.floor(Math.random() * colors.length)],
    })
    setNewMember('')
    onReload()
  }

  async function removeMember(id: string) {
    if (!confirm('Rimuovere questo membro e tutti i suoi voti?')) return
    // Delete their votes first, then the member
    await supabase.from('votes').delete().eq('member_id', id)
    await supabase.from('members').delete().eq('id', id)
    onReload()
  }

  async function handleMerge() {
    if (!mergeFrom || !mergeTo || mergeFrom === mergeTo) return
    if (!confirm('Unire i due profili? I voti del duplicato verranno trasferiti.')) return

    // Move all votes from mergeFrom to mergeTo
    await supabase.from('votes').update({ member_id: mergeTo }).eq('member_id', mergeFrom)
    // Also update proposal ownership
    await supabase.from('proposals').update({ member_id: mergeTo }).eq('member_id', mergeFrom)
    // Delete the duplicate member
    await supabase.from('members').delete().eq('id', mergeFrom)

    setMergeFrom(null)
    setMergeTo('')
    onReload()
  }

  return (
    <section className="animate-fade-up">
      <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
        Membri ({members.length})
      </h2>
      <div className="space-y-2">
        {members.map((m, i) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl px-4 py-3 animate-slide-in"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', animationDelay: `${i * 0.04}s`, opacity: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: m.avatar_color }}>{m.name[0].toUpperCase()}</div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{m.name}</p>
                {m.is_admin && (
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--orange)' }}>
                    <Crown size={10} /> Admin
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setMergeFrom(m.id); setMergeTo('') }}
                className="p-2 rounded-lg transition hover:bg-blue-50" style={{ color: 'var(--blue)' }}
                title="Unisci con altro membro">
                <GitMerge size={14} />
              </button>
              <button onClick={() => removeMember(m.id)}
                className="p-2 rounded-lg transition hover:bg-red-50" style={{ color: 'var(--accent)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Merge panel */}
      {mergeFrom && (
        <div className="mt-3 rounded-xl p-4 animate-fade-in"
          style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--blue)' }}>
            Unisci &quot;{members.find(m => m.id === mergeFrom)?.name}&quot; con:
          </p>
          <div className="flex gap-2">
            <select value={mergeTo} onChange={e => setMergeTo(e.target.value)}
              className="flex-1 py-2 px-3 rounded-xl text-sm focus:outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <option value="">Seleziona membro...</option>
              {members.filter(m => m.id !== mergeFrom).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button onClick={handleMerge} disabled={!mergeTo}
              className="px-3 py-2 rounded-xl text-white text-xs font-semibold transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--blue)' }}>
              Unisci
            </button>
            <button onClick={() => setMergeFrom(null)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition hover:bg-gray-100"
              style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Add member */}
      <div className="flex gap-2 mt-3">
        <input placeholder="Aggiungi membro..." value={newMember}
          onChange={e => setNewMember(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()}
          className="flex-1 py-2.5 px-3.5 rounded-xl text-sm focus:outline-none transition-all"
          style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        <button onClick={addMember}
          className="py-2.5 px-4 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 transition hover:opacity-90"
          style={{ background: 'var(--accent)' }}>
          <Plus size={14} /> Aggiungi
        </button>
      </div>
    </section>
  )
}
