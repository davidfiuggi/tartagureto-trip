'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateCode, randomColor, setSession } from '@/lib/utils'
import { Compass, Users, ArrowRight, Plus, LogIn, ArrowLeft, Lock, MapPin, Calendar, Wallet, Sparkles } from 'lucide-react'

const FEATURES = [
  { icon: MapPin, title: 'Vote on Destinations', desc: 'Propose and rank your dream spots', color: 'var(--accent)', bg: 'var(--accent-light)' },
  { icon: Calendar, title: 'Find the Best Dates', desc: 'Align everyone\'s availability', color: 'var(--blue)', bg: 'var(--blue-light)' },
  { icon: Wallet, title: 'Set the Budget', desc: 'Agree on spending together', color: 'var(--green)', bg: 'var(--green-light)' },
  { icon: Sparkles, title: 'Plan Activities', desc: 'Decide what to do on the trip', color: 'var(--purple)', bg: 'var(--purple-light)' },
]

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
    if (!name.trim() || !tripName.trim() || !adminPwd.trim()) { setError('Please fill in all fields'); return }
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
    if (!name.trim() || !code.trim()) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    const tripCode = code.trim().toUpperCase()
    const { data: trip } = await supabase.from('trips').select().eq('code', tripCode).single()
    if (!trip) { setError('Trip not found. Double-check the code.'); setLoading(false); return }
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
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
            <Compass size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Tartagureto</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('join')}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-gray-100"
            style={{ color: 'var(--muted)' }}>
            Join Trip
          </button>
          <button onClick={() => setMode('create')}
            className="text-sm font-medium px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}>
            Create Trip
          </button>
        </div>
      </nav>

      {/* Hero or Form */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        {mode === 'home' && (
          <div className="max-w-2xl mx-auto text-center animate-fade-up">
            {/* Hero icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: 'var(--accent-light)' }}>
              <Users size={28} style={{ color: 'var(--accent)' }} />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4"
              style={{ color: 'var(--foreground)' }}>
              Plan your trip,<br />
              <span style={{ color: 'var(--accent)' }}>together.</span>
            </h1>

            <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
              Create a trip, invite your friends, and vote on destinations, dates, budget, and activities. No account needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <button onClick={() => setMode('create')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)' }}>
                <Plus size={18} /> Create a Trip
              </button>
              <button onClick={() => setMode('join')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base transition-all hover:bg-gray-100 active:scale-[0.98]"
                style={{ color: 'var(--foreground)', border: '1.5px solid var(--border)' }}>
                <LogIn size={18} /> Join a Trip
              </button>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl text-left animate-fade-up"
                  style={{ background: 'var(--card)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', animationDelay: `${0.1 + i * 0.08}s`, opacity: 0 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: f.bg }}>
                    <f.icon size={18} style={{ color: f.color }} />
                  </div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>{f.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="w-full max-w-md animate-scale-in">
            <div className="rounded-3xl p-8" style={{ background: 'var(--card)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                  <Plus size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Create a new trip</h2>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Share the code with your friends</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Your name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marco"
                    className="w-full py-3 px-4 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Trip name</label>
                  <input value={tripName} onChange={e => setTripName(e.target.value)} placeholder="e.g. Sardegna 2026"
                    className="w-full py-3 px-4 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Admin password</label>
                  <div className="relative">
                    <input type="password" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="To manage the trip"
                      className="w-full py-3 px-4 pr-10 rounded-xl text-sm focus:outline-none transition-all"
                      style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-light)' }} />
                  </div>
                </div>
              </div>
              {error && <p className="text-sm mt-3 animate-fade-in" style={{ color: 'var(--accent)' }}>{error}</p>}
              <button onClick={handleCreate} disabled={loading}
                className="w-full mt-5 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'var(--accent)' }}>
                {loading ? 'Creating...' : <><span>Create Trip</span><ArrowRight size={16} /></>}
              </button>
              <button onClick={() => { setMode('home'); setError('') }}
                className="w-full mt-3 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors hover:opacity-70"
                style={{ color: 'var(--muted)' }}>
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="w-full max-w-md animate-scale-in">
            <div className="rounded-3xl p-8" style={{ background: 'var(--card)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-light)' }}>
                  <LogIn size={18} style={{ color: 'var(--blue)' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Join a trip</h2>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Enter the code shared by your friend</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Your name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Giulia"
                    className="w-full py-3 px-4 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>Trip code</label>
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="A1B2C3"
                    className="w-full py-3 px-4 rounded-xl text-center text-xl font-mono tracking-[0.3em] focus:outline-none transition-all"
                    style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>
              {error && <p className="text-sm mt-3 animate-fade-in" style={{ color: 'var(--accent)' }}>{error}</p>}
              <button onClick={handleJoin} disabled={loading}
                className="w-full mt-5 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'var(--blue)' }}>
                {loading ? 'Joining...' : <><span>Join Trip</span><ArrowRight size={16} /></>}
              </button>
              <button onClick={() => { setMode('home'); setError('') }}
                className="w-full mt-3 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors hover:opacity-70"
                style={{ color: 'var(--muted)' }}>
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
