'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trip, Member, Vote, DbProposal, DB_TYPE_TO_CATEGORY } from '@/lib/types'
import { Settings, Lock, ArrowLeft, Trash2, Crown, Plus, AlertTriangle } from 'lucide-react'

export default function AdminPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
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

    // Load proposals with votes, transform to flat Vote[]
    const { data: proposalsData } = await supabase
      .from('proposals').select('*, votes(*)').eq('trip_id', tripData.id)
    const dbProposals: DbProposal[] = proposalsData || []
    const flatVotes: Vote[] = dbProposals.flatMap(p => {
      const category = DB_TYPE_TO_CATEGORY[p.type] || p.type
      return (p.votes || [])
        .filter(v => v.vote === 1)
        .map(v => ({
          id: v.id, trip_id: p.trip_id, member_id: v.member_id,
          category: category as Vote['category'], option_id: p.title, created_at: v.created_at,
        }))
    })
    setVotes(flatVotes)
  }, [code, router])

  useEffect(() => { loadData() }, [loadData])

  function handleLogin() {
    if (trip && password === trip.admin_password) { setAuthed(true); setError('') }
    else setError('Incorrect password')
  }

  async function removeMember(id: string) {
    await supabase.from('members').delete().eq('id', id)
    loadData()
  }

  async function addMember() {
    if (!newMember.trim() || !trip) return
    const colors = ['#FF6B6B', '#4A90D9', '#2ECC71', '#F39C12', '#9B59B6', '#E17055']
    await supabase.from('members').insert({
      trip_id: trip.id, name: newMember.trim(),
      avatar_color: colors[Math.floor(Math.random() * colors.length)],
    })
    setNewMember(''); loadData()
  }

  async function resetVotes() {
    if (!trip) return
    if (confirm('Reset all votes? This cannot be undone.')) {
      // Delete all proposals (cascades to votes)
      await supabase.from('proposals').delete().eq('trip_id', trip.id)
      loadData()
    }
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-6 h-6 rounded-full animate-spin"
          style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-sm rounded-3xl p-8 animate-scale-in"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'var(--orange-light)' }}>
              <Lock size={22} style={{ color: 'var(--orange)' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Admin Panel</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{trip.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter admin password"
              className="w-full py-3 px-4 rounded-xl text-sm focus:outline-none transition-all"
              style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
              onFocus={e => e.target.style.borderColor = 'var(--orange)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          {error && <p className="text-sm mt-3 animate-fade-in" style={{ color: 'var(--accent)' }}>{error}</p>}
          <button onClick={handleLogin}
            className="w-full mt-4 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: 'var(--orange)' }}>Login</button>
          <button onClick={() => router.push(`/trip/${code}`)}
            className="w-full mt-3 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition hover:opacity-70"
            style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={14} /> Back to trip
          </button>
        </div>
      </div>
    )
  }

  const destVotes = votes.filter(v => v.category === 'destination').length
  const budgetVotesCount = votes.filter(v => v.category === 'budget').length
  const whenVotes = votes.filter(v => v.category === 'weekend_type' || v.category === 'month').length

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--background)' }}>
      <div className="sticky top-0 z-20 px-4 py-3"
        style={{ background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--orange-light)' }}>
              <Settings size={18} style={{ color: 'var(--orange)' }} />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Admin Panel</h1>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{trip.name}</p>
            </div>
          </div>
          <button onClick={() => router.push(`/trip/${code}`)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition hover:bg-gray-100"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        <section className="animate-fade-up">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Members ({members.length})
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
                {!m.is_admin && (
                  <button onClick={() => removeMember(m.id)}
                    className="p-2 rounded-lg transition hover:bg-red-50" style={{ color: 'var(--accent)' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input placeholder="Add member by name" value={newMember}
              onChange={e => setNewMember(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()}
              className="flex-1 py-2.5 px-3.5 rounded-xl text-sm focus:outline-none transition-all"
              style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <button onClick={addMember}
              className="py-2.5 px-4 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 transition hover:opacity-90"
              style={{ background: 'var(--accent)' }}>
              <Plus size={14} /> Add
            </button>
          </div>
        </section>

        <section className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Vote Summary
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'var(--accent-light)', border: '1px solid var(--border)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{destVotes}</p>
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Destination</p>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'var(--green-light)', border: '1px solid var(--border)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>{budgetVotesCount}</p>
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Budget</p>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--blue)' }}>{whenVotes}</p>
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>When</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-5 animate-fade-up"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', animationDelay: '0.2s', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Danger Zone</h2>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>These actions are irreversible.</p>
          <div className="flex gap-2">
            <button onClick={resetVotes}
              className="text-xs font-medium px-4 py-2 rounded-xl transition hover:bg-red-100"
              style={{ color: 'var(--orange)', border: '1px solid var(--orange)' }}>
              Reset all votes
            </button>
            <button onClick={async () => {
              if (confirm('Delete this trip and ALL data? This cannot be undone.')) {
                await supabase.from('trips').delete().eq('id', trip.id); router.push('/')
              }
            }} className="text-xs font-medium px-4 py-2 rounded-xl transition hover:bg-red-100"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent)' }}>
              Delete entire trip
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
