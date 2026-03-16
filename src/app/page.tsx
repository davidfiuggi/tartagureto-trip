'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { randomColor, setSession } from '@/lib/utils'
import { Lock, ArrowRight, Compass } from 'lucide-react'

const TRIP_CODE = '4QWCVL'
const TRIP_PASSWORD = 'tartagureto'

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState<'password' | 'name'>('password')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handlePassword() {
    if (password.trim().toLowerCase() !== TRIP_PASSWORD) {
      setError('Password sbagliata!')
      return
    }
    setError('')
    setStep('name')
  }

  async function handleJoin() {
    if (!name.trim()) { setError('Inserisci il tuo nome'); return }
    setLoading(true)
    setError('')

    const { data: trip } = await supabase
      .from('trips').select().eq('code', TRIP_CODE).single()
    if (!trip) { setError('Trip not found'); setLoading(false); return }

    // Check if member already exists (returning user)
    const { data: existing } = await supabase
      .from('members').select().eq('trip_id', trip.id).eq('name', name.trim()).single()
    if (existing) {
      setSession(TRIP_CODE, existing.id, existing.name)
      router.push(`/trip/${TRIP_CODE}`)
      return
    }

    // Create new member
    const { data: member, error: memErr } = await supabase
      .from('members').insert({
        trip_id: trip.id, name: name.trim(), avatar_color: randomColor(),
      }).select().single()
    if (memErr) { setError(memErr.message); setLoading(false); return }

    setSession(TRIP_CODE, member.id, member.name)
    router.push(`/trip/${TRIP_CODE}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4"
            style={{ background: 'var(--accent-light)' }}>
            <span className="text-4xl">🐢</span>
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--foreground)' }}>
            Tartagureto Beach 2026
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Pianifica il viaggio insieme!
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 animate-scale-in"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>

          {step === 'password' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                  style={{ background: 'var(--orange-light)' }}>
                  <Lock size={20} style={{ color: 'var(--orange)' }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  Entra nel viaggio
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Inserisci la password del gruppo
                </p>
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePassword()}
                  placeholder="Password..."
                  className="w-full py-3 px-4 rounded-xl text-sm text-center focus:outline-none transition-all"
                  style={{
                    background: 'var(--background)', border: '1.5px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm mt-3 text-center animate-fade-in" style={{ color: 'var(--accent)' }}>{error}</p>}
              <button
                onClick={handlePassword}
                className="w-full mt-4 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'var(--accent)' }}>
                Avanti <ArrowRight size={16} />
              </button>
            </>
          )}

          {step === 'name' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                  style={{ background: 'var(--accent-light)' }}>
                  <Compass size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  Come ti chiami?
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  I tuoi amici ti vedranno con questo nome
                </p>
              </div>
              <div>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  placeholder="Il tuo nome..."
                  className="w-full py-3 px-4 rounded-xl text-sm text-center focus:outline-none transition-all"
                  style={{
                    background: 'var(--background)', border: '1.5px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm mt-3 text-center animate-fade-in" style={{ color: 'var(--accent)' }}>{error}</p>}
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'var(--accent)' }}>
                {loading ? 'Entro...' : <>Entra <ArrowRight size={16} /></>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
