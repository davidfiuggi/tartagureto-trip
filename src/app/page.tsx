'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateCode, randomColor, setSession } from '@/lib/utils'

function Particles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string; delay: number }[]>([])
  useEffect(() => {
    const colors = ['#6C5CE7', '#FD79A8', '#00B894', '#FDCB6E', '#A855F7']
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 2 + Math.random() * 4, color: colors[i % colors.length],
      delay: Math.random() * 5,
    })))
  }, [])
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
          background: p.color, animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  )
}

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
    if (!name.trim() || !tripName.trim() || !adminPwd.trim()) { setError('Fill in all fields'); return }
    setLoading(true); setError('')
    const tripCode = generateCode()
    const { data: trip, error: tripErr } = await supabase
      .from('trips').insert({ name: tripName.trim(), code: tripCode, admin_password: adminPwd.trim() })
      .select().single()
    if (tripErr) { setError(tripErr.message); setLoading(false); return }
    const { data: member, error: memErr } = await supabase
      .from('members').insert({ trip_id: trip.id, name: name.trim(), avatar_color: randomColor(), is_admin: true })
      .select().single()
    if (memErr) { setError(memErr.message); setLoading(false); return }
    setSession(tripCode, member.id, member.name)
    router.push(`/trip/${tripCode}`)
  }

  async function handleJoin() {
    if (!name.trim() || !code.trim()) { setError('Fill in all fields'); return }
    setLoading(true); setError('')
    const tripCode = code.trim().toUpperCase()
    const { data: trip } = await supabase.from('trips').select().eq('code', tripCode).single()
    if (!trip) { setError('Trip not found. Check the code.'); setLoading(false); return }
    const { data: existing } = await supabase.from('members').select().eq('trip_id', trip.id).eq('name', name.trim()).single()
    if (existing) { setSession(tripCode, existing.id, existing.name); router.push(`/trip/${tripCode}`); return }
    const { data: member, error: memErr } = await supabase
      .from('members').insert({ trip_id: trip.id, name: name.trim(), avatar_color: randomColor() })
      .select().single()
    if (memErr) { setError(memErr.message); setLoading(false); return }
    setSession(tripCode, member.id, member.name)
    router.push(`/trip/${tripCode}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Particles />
      <div className="w-full max-w-md relative z-10">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 mb-5 animate-float animate-pulse-glow">
            <span className="text-4xl">🐢</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-muted bg-clip-text text-transparent">
            Tartagureto Trip
          </h1>
          <p className="text-muted text-sm mt-2">Plan your group vacation together</p>
        </div>

        {mode === 'home' && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
            <button onClick={() => setMode('create')}
              className="w-full py-4 px-6 rounded-2xl btn-glow text-white font-semibold text-base flex items-center justify-center gap-3">
              <span className="text-xl">✨</span> Create a Trip
            </button>
            <button onClick={() => setMode('join')}
              className="w-full py-4 px-6 rounded-2xl btn-outline text-white font-semibold text-base flex items-center justify-center gap-3">
              <span className="text-xl">🔗</span> Join a Trip
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="glass rounded-3xl p-6 space-y-4 animate-fade-up">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg font-bold">Create a new trip</h2>
            </div>
            <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
              className="w-full py-3 px-4 rounded-xl input-glass text-white placeholder:text-muted" />
            <input placeholder="Trip name (e.g. Sardegna 2026)" value={tripName} onChange={e => setTripName(e.target.value)}
              className="w-full py-3 px-4 rounded-xl input-glass text-white placeholder:text-muted" />
            <input placeholder="Admin password" type="password" value={adminPwd} onChange={e => setAdminPwd(e.target.value)}
              className="w-full py-3 px-4 rounded-xl input-glass text-white placeholder:text-muted" />
            <p className="text-xs text-muted">This password protects the admin panel</p>
            {error && <p className="text-pink text-sm animate-fade-in">{error}</p>}
            <button onClick={handleCreate} disabled={loading}
              className="w-full py-3.5 rounded-2xl btn-glow text-white font-semibold disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
            <button onClick={() => { setMode('home'); setError('') }}
              className="w-full text-muted text-sm hover:text-white transition">Back</button>
          </div>
        )}

        {mode === 'join' && (
          <div className="glass rounded-3xl p-6 space-y-4 animate-fade-up">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔗</span>
              <h2 className="text-lg font-bold">Join a trip</h2>
            </div>
            <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
              className="w-full py-3 px-4 rounded-xl input-glass text-white placeholder:text-muted" />
            <input placeholder="Trip code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6}
              className="w-full py-3 px-4 rounded-xl input-glass text-white placeholder:text-muted tracking-[0.3em] text-center text-xl font-mono" />
            {error && <p className="text-pink text-sm animate-fade-in">{error}</p>}
            <button onClick={handleJoin} disabled={loading}
              className="w-full py-3.5 rounded-2xl btn-glow text-white font-semibold disabled:opacity-50">
              {loading ? 'Joining...' : 'Join Trip'}
            </button>
            <button onClick={() => { setMode('home'); setError('') }}
              className="w-full text-muted text-sm hover:text-white transition">Back</button>
          </div>
        )}

        <p className="text-center text-muted/40 text-xs mt-8 animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
          Made with love by the Tartagureto crew
        </p>
      </div>
    </div>
  )
}
