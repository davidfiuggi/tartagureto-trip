'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trip, Member, Proposal } from '@/lib/types'
import { PROPOSAL_LABELS } from '@/lib/utils'

export default function AdminPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [newMember, setNewMember] = useState('')

  const loadData = useCallback(async () => {
    const { data: tripData } = await supabase.from('trips').select().eq('code', code).single()
    if (!tripData) { router.push('/'); return }
    setTrip(tripData)
    const { data: membersData } = await supabase
      .from('members').select().eq('trip_id', tripData.id).order('created_at')
    setMembers(membersData || [])
    const { data: proposalsData } = await supabase
      .from('proposals').select().eq('trip_id', tripData.id).order('created_at')
    setProposals(proposalsData || [])
  }, [code, router])

  useEffect(() => { loadData() }, [loadData])

  function handleLogin() {
    if (trip && password === trip.admin_password) { setAuthed(true); setError('') }
    else setError('Wrong password')
  }

  async function removeMember(id: string) {
    await supabase.from('members').delete().eq('id', id); loadData()
  }
  async function removeProposal(id: string) {
    await supabase.from('proposals').delete().eq('id', id); loadData()
  }
  async function addMember() {
    if (!newMember.trim() || !trip) return
    const colors = ['#6C5CE7', '#FD79A8', '#00B894', '#FDCB6E', '#A855F7', '#E17055']
    await supabase.from('members').insert({
      trip_id: trip.id, name: newMember.trim(),
      avatar_color: colors[Math.floor(Math.random() * colors.length)],
    })
    setNewMember(''); loadData()
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-float text-4xl">🐢</div>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm glass rounded-3xl p-6 space-y-4 animate-fade-up">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 mb-3">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-lg font-bold">Admin Panel</h2>
            <p className="text-muted text-sm mt-1">{trip.name}</p>
          </div>
          <input type="password" placeholder="Admin password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full py-3 px-4 rounded-xl input-glass text-white placeholder:text-muted" />
          {error && <p className="text-pink text-sm animate-fade-in">{error}</p>}
          <button onClick={handleLogin}
            className="w-full py-3.5 rounded-2xl btn-glow text-white font-semibold">Login</button>
          <button onClick={() => router.push(`/trip/${code}`)}
            className="w-full text-muted text-sm hover:text-white transition">Back to trip</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="glass border-b border-white/5 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <span className="text-lg">⚙️</span>
            </div>
            <div>
              <h1 className="text-base font-bold">Admin Panel</h1>
              <p className="text-muted text-[11px]">{trip.name} &middot; <span className="font-mono">{trip.code}</span></p>
            </div>
          </div>
          <button onClick={() => router.push(`/trip/${code}`)}
            className="text-xs text-muted hover:text-white transition px-3 py-2 rounded-xl glass">
            Back
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* Members */}
        <section className="animate-fade-up">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            Members ({members.length})
          </h2>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between glass rounded-xl px-4 py-3 animate-slide-in"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${m.avatar_color}, ${m.avatar_color}88)` }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    {m.is_admin && <p className="text-xs text-gold">Admin &#9733;</p>}
                  </div>
                </div>
                {!m.is_admin && (
                  <button onClick={() => removeMember(m.id)}
                    className="text-xs text-pink/70 hover:text-pink transition px-3 py-1.5 rounded-lg hover:bg-pink/10">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input placeholder="Add member by name" value={newMember}
              onChange={e => setNewMember(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()}
              className="flex-1 py-2.5 px-3.5 rounded-xl input-glass text-white text-sm placeholder:text-muted" />
            <button onClick={addMember}
              className="py-2.5 px-5 rounded-xl btn-glow text-white text-sm font-semibold">Add</button>
          </div>
        </section>

        {/* Proposals */}
        <section className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            All Proposals ({proposals.length})
          </h2>
          {proposals.length === 0 && <p className="text-muted text-sm">No proposals yet</p>}
          <div className="space-y-2">
            {proposals.map((p, i) => {
              const member = members.find(m => m.id === p.member_id)
              const label = PROPOSAL_LABELS[p.type]
              return (
                <div key={p.id} className="flex items-center justify-between glass rounded-xl px-4 py-3 animate-slide-in"
                  style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      <span className="mr-1.5">{label?.emoji}</span>{p.title}
                    </p>
                    <p className="text-xs text-muted">by {member?.name || '?'}</p>
                  </div>
                  <button onClick={() => removeProposal(p.id)}
                    className="text-xs text-pink/70 hover:text-pink transition px-3 py-1.5 rounded-lg hover:bg-pink/10 flex-shrink-0">
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-2xl p-5 animate-fade-up" style={{
          animationDelay: '0.2s', opacity: 0,
          background: 'rgba(253, 121, 168, 0.05)', border: '1px solid rgba(253, 121, 168, 0.15)'
        }}>
          <h2 className="text-sm font-semibold text-pink mb-3 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h2>
          <button onClick={async () => {
            if (confirm('Delete this trip and ALL data? This cannot be undone!')) {
              await supabase.from('trips').delete().eq('id', trip.id); router.push('/')
            }
          }} className="text-xs text-pink/70 hover:text-pink transition px-4 py-2 rounded-xl hover:bg-pink/10">
            Delete entire trip
          </button>
        </section>
      </div>
    </div>
  )
}
