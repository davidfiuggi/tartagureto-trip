'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateCode, randomColor, setSession } from '@/lib/utils'

export default function Home() {
  const router = useRouter()
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home')
  const [name, setName] = useState('')
  const [tripName, setTripName] = useState('')
  const [code, setCode] = useState('')
  const [adminPwd, setAdminPwd] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim() || !tripName.trim() || !adminPwd.trim()) {
      setError('Fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    const tripCode = generateCode()

    const { data: trip, error: tripErr } = await supabase
      .from('trips')
      .insert({ name: tripName.trim(), code: tripCode, admin_password: adminPwd.trim() })
      .select()
      .single()

    if (tripErr) { setError(tripErr.message); setLoading(false); return }

    const { data: member, error: memErr } = await supabase
      .from('members')
      .insert({ trip_id: trip.id, name: name.trim(), avatar_color: randomColor(), is_admin: true })
      .select()
      .single()

    if (memErr) { setError(memErr.message); setLoading(false); return }

    setSession(tripCode, member.id, member.name)
    router.push(`/trip/${tripCode}`)
  }

  async function handleJoin() {
    if (!name.trim() || !code.trim()) {
      setError('Fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    const tripCode = code.trim().toUpperCase()

    const { data: trip, error: tripErr } = await supabase
      .from('trips')
      .select()
      .eq('code', tripCode)
      .single()

    if (tripErr || !trip) { setError('Trip not found. Check the code.'); setLoading(false); return }

    // Check if member already exists
    const { data: existing } = await supabase
      .from('members')
      .select()
      .eq('trip_id', trip.id)
      .eq('name', name.trim())
      .single()

    if (existing) {
      setSession(tripCode, existing.id, existing.name)
      router.push(`/trip/${tripCode}`)
      return
    }

    const { data: member, error: memErr } = await supabase
      .from('members')
      .insert({ trip_id: trip.id, name: name.trim(), avatar_color: randomColor() })
      .select()
      .single()

    if (memErr) { setError(memErr.message); setLoading(false); return }

    setSession(tripCode, member.id, member.name)
    router.push(`/trip/${tripCode}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
            <span className="text-3xl">🐢</span>
          </div>
          <h1 className="text-2xl font-bold">Tartagureto Trip</h1>
          <p className="text-muted text-sm mt-1">Plan your group vacation together</p>
        </div>

        {mode === 'home' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full py-3 px-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition"
            >
              Create a Trip
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-3 px-4 rounded-xl bg-card border border-border text-white font-semibold hover:bg-border/50 transition"
            >
              Join a Trip
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Create a new trip</h2>
            <input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-white placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <input
              placeholder="Trip name (e.g. Sardegna 2026)"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-white placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <input
              placeholder="Admin password"
              type="password"
              value={adminPwd}
              onChange={e => setAdminPwd(e.target.value)}
              className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-white placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-muted">You&apos;ll use this password to access the admin panel</p>
            {error && <p className="text-pink text-sm">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
            <button onClick={() => { setMode('home'); setError('') }} className="w-full text-muted text-sm">
              Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Join a trip</h2>
            <input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-white placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <input
              placeholder="Trip code (e.g. A1B2C3)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-white placeholder:text-muted focus:outline-none focus:border-accent tracking-widest text-center text-lg font-mono"
            />
            {error && <p className="text-pink text-sm">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Trip'}
            </button>
            <button onClick={() => { setMode('home'); setError('') }} className="w-full text-muted text-sm">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
