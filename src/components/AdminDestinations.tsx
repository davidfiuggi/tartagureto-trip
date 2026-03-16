'use client'

import { DbProposal } from '@/lib/types'
import { destinations } from '@/lib/destinations-data'
import { Trash2, MapPin, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  proposals: DbProposal[]
  onReload: () => void
}

const PREDEFINED_IDS = new Set(destinations.map(d => d.id))

export default function AdminDestinations({ proposals, onReload }: Props) {
  const customDests = proposals.filter(p => p.type === 'destination' && !PREDEFINED_IDS.has(p.title))

  async function removeDestination(proposalId: string) {
    if (!confirm('Eliminare questa destinazione e tutti i suoi voti?')) return
    await supabase.from('proposals').delete().eq('id', proposalId)
    onReload()
  }

  async function renameDestination(proposalId: string, currentTitle: string) {
    const newName = prompt('Nuovo nome per la destinazione:', currentTitle)
    if (!newName || newName.trim() === currentTitle) return
    await supabase.from('proposals').update({ title: newName.trim() }).eq('id', proposalId)
    onReload()
  }

  if (customDests.length === 0) {
    return (
      <section className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
          <MapPin size={12} className="inline mr-1" /> Destinazioni Proposte
        </h2>
        <div className="rounded-xl p-4 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs italic" style={{ color: 'var(--muted-light)' }}>
            Nessuna destinazione personalizzata proposta
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
      <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
        <MapPin size={12} className="inline mr-1" /> Destinazioni Proposte ({customDests.length})
      </h2>
      <div className="space-y-2">
        {customDests.map((p, i) => {
          const voteCount = (p.votes || []).filter(v => v.vote === 1).length
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-xl px-4 py-3 animate-slide-in"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', animationDelay: `${i * 0.04}s`, opacity: 0 }}>

              {/* Thumbnail */}
              {p.description && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={p.description} alt={p.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                  {p.title}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {voteCount} {voteCount === 1 ? 'voto' : 'voti'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => renameDestination(p.id, p.title)}
                  className="p-2 rounded-lg transition hover:bg-blue-50"
                  style={{ color: 'var(--blue)' }} title="Rinomina">
                  <ExternalLink size={14} />
                </button>
                <button onClick={() => removeDestination(p.id)}
                  className="p-2 rounded-lg transition hover:bg-red-50"
                  style={{ color: 'var(--accent)' }} title="Elimina">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
