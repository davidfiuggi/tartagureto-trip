'use client'

interface Props {
  name: string
  imageUrl: string
  voters: string[]
  hasVoted: boolean
  onToggle: () => void
  index: number
}

export default function CustomDestinationCard({ name, imageUrl, voters, hasVoted, onToggle, index }: Props) {
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
      <div className="relative h-36 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-base">{name}</p>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full text-white/90 mt-1 inline-block"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
          >
            Proposta
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
