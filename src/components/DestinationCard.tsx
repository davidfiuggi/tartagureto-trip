'use client'

import { Destination } from '@/lib/destinations-data'

interface Props {
  destination: Destination
  voters: string[]
  hasVoted: boolean
  onToggle: () => void
  onShowDetails: () => void
  index: number
}

export default function DestinationCard({ destination, voters, hasVoted, onToggle, onShowDetails, index }: Props) {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-fade-up"
      style={{
        background: 'var(--card)',
        border: hasVoted ? '2px solid var(--accent)' : '1px solid var(--border)',
        boxShadow: hasVoted ? '0 4px 16px rgba(255, 107, 107, 0.15)' : 'var(--shadow-sm)',
        animationDelay: `${index * 0.06}s`,
        opacity: 0,
      }}
    >
      {/* Image */}
      <div className="relative h-36 cursor-pointer overflow-hidden" onClick={onShowDetails}>
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-base">{destination.name}</p>
          <div className="flex gap-1.5 mt-1">
            {destination.tags.map(tag => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full text-white/90"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-lg text-white"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          >
            {destination.priceRange}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <button
          onClick={onToggle}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
          style={{
            background: hasVoted ? 'var(--accent)' : 'var(--background)',
            color: hasVoted ? '#fff' : 'var(--foreground)',
            border: hasVoted ? 'none' : '1.5px solid var(--border)',
          }}
        >
          {hasVoted ? '✓ Ci sono!' : 'Mi interessa'}
        </button>

        {voters.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              {voters.length} 👍
            </span>
            <span className="text-xs truncate" style={{ color: 'var(--muted)' }}>
              {voters.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
