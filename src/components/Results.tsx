'use client'

import { useState } from 'react'
import { Vote, Member } from '@/lib/types'
import { destinations } from '@/lib/destinations-data'
import { budgetOptions, weekendTypes, availableMonths } from '@/lib/voting-options'
import { Trophy } from 'lucide-react'

interface Props {
  votes: Vote[]
  members: Member[]
}

interface Winner {
  name: string
  count: number
  icon: string
}

function getWinner(
  votes: Vote[],
  category: string,
  options: { id: string; name?: string; label?: string }[],
): Winner | null {
  let best = ''
  let bestCount = 0
  options.forEach(opt => {
    const count = votes.filter(v => v.category === category && v.option_id === opt.id).length
    if (count > bestCount) {
      bestCount = count
      best = opt.id
    }
  })
  if (!best) return null
  const found = options.find(o => o.id === best)
  return { name: (found as { name?: string; label?: string })?.name || (found as { label?: string })?.label || best, count: bestCount, icon: '' }
}

function getRanking(votes: Vote[], members: Member[]) {
  const destVotes: Record<string, string[]> = {}
  votes
    .filter(v => v.category === 'destination')
    .forEach(v => {
      if (!destVotes[v.option_id]) destVotes[v.option_id] = []
      const name = members.find(m => m.id === v.member_id)?.name || '?'
      destVotes[v.option_id].push(name)
    })

  return Object.entries(destVotes)
    .map(([id, voters]) => ({
      id,
      name: destinations.find(d => d.id === id)?.name || id,
      voters,
      count: voters.length,
    }))
    .sort((a, b) => b.count - a.count)
}

export default function Results({ votes, members }: Props) {
  const [celebrating, setCelebrating] = useState(false)

  const destWinner = getWinner(
    votes,
    'destination',
    destinations.map(d => ({ id: d.id, name: d.name })),
  )
  const budgetWinner = getWinner(votes, 'budget', budgetOptions.map(b => ({ id: b.id, name: b.label })))
  const weekendWinner = getWinner(votes, 'weekend_type', weekendTypes.map(w => ({ id: w.id, name: `${w.icon} ${w.name}` })))
  const monthWinner = getWinner(votes, 'month', availableMonths.map(m => ({ id: m.id, name: m.name })))
  const ranking = getRanking(votes, members)

  function celebrate() {
    setCelebrating(true)
    setTimeout(() => setCelebrating(false), 5000)
  }

  // Discussion points
  const points: string[] = []
  if (destWinner) points.push(`🏆 ${destWinner.name} is the favorite!`)
  if (ranking.length >= 2 && ranking[0].count === ranking[1].count)
    points.push(`⚖️ Tie with ${ranking[1].name}!`)
  if (budgetWinner) points.push(`💰 Budget: ${budgetWinner.name} per night`)
  if (weekendWinner && monthWinner) points.push(`📅 ${weekendWinner.name} in ${monthWinner.name}`)
  points.push(`👥 We are ${members.length}`)

  return (
    <div className="space-y-4 relative">
      {/* Confetti overlay */}
      {celebrating && <ConfettiOverlay destName={destWinner?.name} onClose={() => setCelebrating(false)} />}

      <div className="text-center mb-2 animate-fade-up">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Il Verdetto!</h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Ecco cosa ne pensa il gruppo...</p>
      </div>

      {/* Winner cards */}
      <div className="grid grid-cols-2 gap-3">
        <ResultCard
          title="Meta Preferita"
          icon="🏆"
          value={destWinner?.name}
          votes={destWinner?.count}
          color="var(--accent)"
          bg="var(--accent-light)"
          index={0}
        />
        <ResultCard
          title="Budget a Notte"
          icon="💰"
          value={budgetWinner?.name}
          votes={budgetWinner?.count}
          color="var(--green)"
          bg="var(--green-light)"
          index={1}
        />
        <ResultCard
          title="Periodo"
          icon="📅"
          value={weekendWinner && monthWinner ? `${weekendWinner.name}\n${monthWinner.name} 2026` : weekendWinner?.name || monthWinner?.name}
          votes={weekendWinner?.count || monthWinner?.count}
          color="var(--blue)"
          bg="var(--blue-light)"
          index={2}
        />
        <ResultCard
          title="Partecipanti"
          icon="👥"
          value={members.map(m => m.name).join(' · ')}
          color="var(--purple)"
          bg="var(--purple-light)"
          index={3}
        />
      </div>

      {/* Ranking breakdown */}
      {ranking.length > 0 && (
        <div
          className="rounded-2xl p-4 animate-fade-up"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', animationDelay: '0.2s', opacity: 0 }}
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Classifica Destinazioni
          </h4>
          <div className="space-y-2.5">
            {ranking.map((item, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''
              const maxCount = ranking[0]?.count || 1
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {medal} {item.name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {item.voters.join(', ')}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.count / maxCount) * 100}%`,
                        background: idx === 0 ? 'var(--accent)' : idx === 1 ? 'var(--orange)' : 'var(--muted-light)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Discussion points */}
      {points.length > 0 && (
        <div
          className="rounded-2xl p-4 animate-fade-up"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', animationDelay: '0.25s', opacity: 0 }}
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            💬 Spunti per la Discussione
          </h4>
          {points.map((p, i) => (
            <p key={i} className="text-sm my-1.5" style={{ color: 'var(--foreground)' }}>
              {p}
            </p>
          ))}
        </div>
      )}

      {/* Celebrate button */}
      <button
        onClick={celebrate}
        className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] animate-fade-up"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--orange))', boxShadow: '0 4px 20px rgba(255,107,107,0.3)', animationDelay: '0.3s', opacity: 0 }}
      >
        🐢 Si Parte! 🐢
      </button>
    </div>
  )
}

function ResultCard({
  title, icon, value, votes, color, bg, index,
}: {
  title: string; icon: string; value?: string | null; votes?: number; color: string; bg: string; index: number
}) {
  return (
    <div
      className="rounded-2xl p-4 animate-fade-up"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', animationDelay: `${index * 0.06}s`, opacity: 0 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: bg }}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          {title}
        </span>
      </div>
      {value ? (
        <>
          <p className="font-bold text-sm whitespace-pre-line" style={{ color: 'var(--foreground)' }}>{value}</p>
          {votes !== undefined && (
            <p className="text-xs mt-1" style={{ color }}>
              {votes} {votes === 1 ? 'voto' : 'voti'}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs italic" style={{ color: 'var(--muted-light)' }}>Nessun voto</p>
      )}
    </div>
  )
}

function ConfettiOverlay({ destName, onClose }: { destName?: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
              background: ['#FF6B6B', '#4A90D9', '#2ECC71', '#F39C12', '#9B59B6', '#E17055'][
                Math.floor(Math.random() * 6)
              ],
            }}
          />
        ))}
      </div>

      <div className="text-center animate-scale-in z-10" onClick={e => e.stopPropagation()}>
        <div className="text-6xl mb-4">🐢</div>
        <h2 className="text-2xl font-extrabold text-white mb-2">TARTAGURETO BEACH 2026</h2>
        {destName && <p className="text-xl font-bold text-white/90 mb-6">{destName}</p>}
        <div className="text-white/80 text-sm mb-6 space-y-1">
          <p>Prossimi passi:</p>
          <p>✓ Confermare date</p>
          <p>✓ Cercare alloggio</p>
          <p>✓ Prenotare!</p>
        </div>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-2xl text-base font-bold transition-all hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          🏖️ Fantastico!
        </button>
      </div>
    </div>
  )
}
