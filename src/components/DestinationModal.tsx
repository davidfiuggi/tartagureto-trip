'use client'

import { Destination } from '@/lib/destinations-data'
import { X } from 'lucide-react'

interface Props {
  destination: Destination
  onClose: () => void
}

export default function DestinationModal({ destination, onClose }: Props) {
  const { lat, lng } = destination.coordinates
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-scale-in"
        style={{ background: 'var(--card)' }}
      >
        {/* Hero image */}
        <div className="relative h-48">
          <img src={destination.imageUrl} alt={destination.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          >
            <X size={16} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-4">
            <h2 className="text-white text-xl font-bold">{destination.name}</h2>
            <span className="text-white/80 text-sm">{destination.country}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
            {destination.description}
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(destination.highlights).map(([key, val]) => {
              const labels: Record<string, string> = {
                beaches: '🏖️ Spiagge',
                nightlife: '🌙 Nightlife',
                food: '🍝 Cibo',
                accessibility: '🚗 Accessibilità',
              }
              return (
                <div
                  key={key}
                  className="rounded-xl p-2.5"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                >
                  <p className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
                    {labels[key] || key}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                    {val}
                  </p>
                </div>
              )
            })}
          </div>

          {/* How to get there */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}
          >
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--blue)' }}>
              ✈️ Come Arrivare
            </h4>
            <p className="text-xs mb-1" style={{ color: 'var(--foreground)' }}>
              {destination.flights.airports.join(' · ')}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {destination.flights.lowCost.join(', ')} — {destination.flights.priceEstimate}
            </p>
          </div>

          {/* Budget */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--green-light)', border: '1px solid var(--border)' }}
          >
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--green)' }}>
              💰 Budget Stimato: {destination.estimatedBudget}
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(destination.budgetBreakdown).map(([key, val]) => {
                const labels: Record<string, string> = {
                  transport: 'Trasporto',
                  accommodation: 'Alloggio',
                  food: 'Cibo',
                  extras: 'Extra',
                }
                return (
                  <p key={key} className="text-xs" style={{ color: 'var(--foreground)' }}>
                    <span style={{ color: 'var(--muted)' }}>{labels[key]}:</span> {val}
                  </p>
                )
              })}
            </div>
            <p className="text-xs mt-2 italic" style={{ color: 'var(--muted)' }}>
              {destination.priceContext}
            </p>
          </div>

          {/* Tips */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--orange-light)', border: '1px solid var(--border)' }}
          >
            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--orange)' }}>
              🎯 Tips
            </h4>
            <p className="text-xs" style={{ color: 'var(--foreground)' }}>
              {destination.tips}
            </p>
          </div>

          {/* Best for */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--purple-light)', border: '1px solid var(--border)' }}
          >
            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--purple)' }}>
              💡 Perfetto Per
            </h4>
            <p className="text-xs" style={{ color: 'var(--foreground)' }}>
              {destination.bestFor}
            </p>
          </div>

          {/* Google Maps button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            🗺️ Apri in Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
