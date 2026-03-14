'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trip, Member, Proposal } from '@/lib/types'

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
    const { data: tripData } = await supabase
      .from('trips')
      .select()
      .eq('code', code)
      .single()

    if (!tripData) { router.push('/'); return }
    setTrip(tripData)

    const { data: membersData } = await supabase
      .from('members')
      .select()
      .eq('trip_id', tripData.id)
      .order('created_at')

    setMembers(membersData || [])

    const { data: proposalsData } = await supabase
      .from('proposals')
      .select()
      .eq('trip_id', tripData.id)
      .order('created_at')

    setProposals(proposalsData || [])
  }, [code, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleLogin() {
    if (trip && password === trip.admin_password) {
      setAuthed(true)
      setError('')
    } else {
      setError('Wrong password')
    }
  }

  async function removeMember(id: string) {
    await supabase.from('members').delete().eq('id', id)
    loadData()
  }

  async function removeProposal(id: string) {
    await supabase.from('proposals').delete().eq('id', id)
    loadData()
  }

  async function addMember() {
    if (!newMember.trim() || !trip) return
    const colors = ['#5666F0', '#FD6C84', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899']
    await supabase.from('members').insert({
      trip_id: trip.id,
      name: newMember.trim(),
      avatar_color: colors[Math.floor(Math.random() * colors.length)],
    })
    setNewMember('')
    loadData()
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <p className="text-muted text-sm">{trip.name}</p>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-white placeholder:text-muted focus:outline-none focus:border-accent"
          />
          {error && <p className="text-pink text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold"
          >
            Login
          </button>
          <button
            onClick={() => router.push(`/trip/${code}`)}
            className="w-full text-muted text-sm"
          >
            Back to trip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Admin: {trip.name}</h1>
            <p className="text-muted text-xs">
              Code: <span className="font-mono tracking-wider">{trip.code}</span>
              {' '}&middot; Share this with your friends!
            </p>
          </div>
          <button
            onClick={() => router.push(`/trip/${code}`)}
            className="text-xs text-muted hover:text-white transition px-3 py-1.5 rounded-lg border border-border"
          >
            Back
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* Members Management */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Members ({members.length})
          </h2>
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: m.avatar_color }}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    {m.is_admin && <p className="text-xs text-accent">Admin</p>}
                  </div>
                </div>
                {!m.is_admin && (
                  <button
                    onClick={() => removeMember(m.id)}
                    className="text-xs text-pink hover:text-pink/80 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* Add member */}
          <div className="flex gap-2 mt-3">
            <input
              placeholder="Add member by name"
              value={newMember}
              onChange={e => setNewMember(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMember()}
              className="flex-1 py-2 px-3 rounded-lg bg-background border border-border text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <button
              onClick={addMember}
              className="py-2 px-4 rounded-lg bg-accent text-white text-sm font-semibold"
            >
              Add
            </button>
          </div>
        </section>

        {/* Proposals Management */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            All Proposals ({proposals.length})
          </h2>
          {proposals.length === 0 && (
            <p className="text-muted text-sm">No proposals yet</p>
          )}
          <div className="space-y-2">
            {proposals.map(p => {
              const member = members.find(m => m.id === p.member_id)
              return (
                <div key={p.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      <span className="text-muted mr-1">[{p.type}]</span>
                      {p.title}
                    </p>
                    <p className="text-xs text-muted">by {member?.name || '?'}</p>
                  </div>
                  <button
                    onClick={() => removeProposal(p.id)}
                    className="text-xs text-pink hover:text-pink/80 transition"
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="border border-pink/20 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-pink mb-2">Danger Zone</h2>
          <button
            onClick={async () => {
              if (confirm('Delete this trip and ALL data? This cannot be undone!')) {
                await supabase.from('trips').delete().eq('id', trip.id)
                router.push('/')
              }
            }}
            className="text-xs text-pink hover:text-pink/80 transition"
          >
            Delete entire trip
          </button>
        </section>
      </div>
    </div>
  )
}
