'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { randomColor, setSession } from '@/lib/utils'
import { Lock, ArrowRight, Compass } from 'lucide-react'

const TRIP_CODE = '4QWCVL'
const TRIP_PASSWORD = 'tartagureto'

const MEMBERS = [
  'Veve', 'Ari', 'Franky', 'Marta', 'Zappy', 'Alis',
  'Manu', 'Arma', 'Guido', 'Teo', 'Andre', 'Dave',
]

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState<'password' | 'name'>('password')
  const [password, setPassword] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
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
    if (!selected) { setError('Scegli chi sei!'); return }
    setLoading(true)
    setError('')

    let { data: trip } = await supabase
      .from('trips').select().eq('code', TRIP_CODE).single()
    if (!trip) {
      // Auto-create the single trip if it doesn't exist
      const { data: created } = await supabase
        .from('trips')
        .insert({ name: 'Tartagureto Beach 2026', code: TRIP_CODE, admin_password: 'admin' })
        .select()
        .single()
      trip = created
    }
    if (!trip) { setError('Errore nella creazione del viaggio'); setLoading(false); return }

    // Check if member already exists (returning user)
    const { data: existing } = await supabase
      .from('members').select().eq('trip_id', trip.id).eq('name', selected).single()
    if (existing) {
      setSession(TRIP_CODE, existing.id, existing.name)
      router.push(`/trip/${TRIP_CODE}`)
      return
    }

    // Create new member
    const { data: member, error: memErr } = await supabase
      .from('members').insert({
        trip_id: trip.id, name: selected, avatar_color: randomColor(),
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
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                  style={{ background: 'var(--accent-light)' }}>
                  <Compass size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  Chi sei?
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Seleziona il tuo nome
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MEMBERS.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => setSelected(m)}
                    className="py-2.5 px-2 rounded-xl text-sm font-medium transition-all active:scale-[0.95] animate-fade-up"
                    style={{
                      background: selected === m ? 'var(--accent)' : 'var(--background)',
                      color: selected === m ? '#fff' : 'var(--foreground)',
                      border: selected === m ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                      boxShadow: selected === m ? '0 2px 8px rgba(255,107,107,0.25)' : 'none',
                      animationDelay: `${i * 0.03}s`,
                      opacity: 0,
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {error && <p className="text-sm mt-3 text-center animate-fade-in" style={{ color: 'var(--accent)' }}>{error}</p>}
              <button
                onClick={handleJoin}
                disabled={loading || !selected}
                className="w-full mt-5 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'var(--accent)' }}>
                {loading ? 'Entro...' : <>Entra come {selected || '...'} <ArrowRight size={16} /></>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
