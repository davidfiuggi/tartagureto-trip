'use client'

import { useState } from 'react'
import { searchPhotos, UnsplashPhoto } from '@/lib/unsplash'
import { Search, Plus, X, Loader2 } from 'lucide-react'

interface Props {
  onAdd: (name: string, imageUrl: string) => void
}

export default function AddDestination({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null)
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setSearched(false)
    setSelectedPhoto(null)
    const results = await searchPhotos(query.trim())
    setPhotos(results)
    setSearching(false)
    setSearched(true)
  }

  function handleConfirm() {
    if (!query.trim() || !selectedPhoto) return
    onAdd(query.trim(), selectedPhoto.url)
    setQuery('')
    setPhotos([])
    setSelectedPhoto(null)
    setSearched(false)
    setOpen(false)
  }

  function handleClose() {
    setOpen(false)
    setQuery('')
    setPhotos([])
    setSelectedPhoto(null)
    setSearched(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-gray-50 active:scale-[0.98] animate-fade-up"
        style={{ border: '2px dashed var(--border)', color: 'var(--muted)' }}
      >
        <Plus size={18} /> Proponi una meta
      </button>
    )
  }

  return (
    <div className="rounded-2xl p-5 animate-scale-in"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          Proponi una meta
        </h3>
        <button onClick={handleClose} className="p-1.5 rounded-lg transition hover:bg-gray-100">
          <X size={16} style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      {/* Search input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Es. Sardegna, Croazia, Maiorca..."
            className="w-full py-2.5 px-4 pr-10 rounded-xl text-sm focus:outline-none transition-all"
            style={{ background: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            autoFocus
          />
          <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-light)' }} />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-4 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : 'Cerca'}
        </button>
      </div>

      {/* Photo results */}
      {searched && photos.length === 0 && (
        <p className="text-xs text-center mt-4" style={{ color: 'var(--muted)' }}>
          Nessuna foto trovata. Prova con un altro nome!
        </p>
      )}

      {photos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
            Scegli una foto per &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-2 gap-2">
            {photos.map(photo => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative h-24 rounded-xl overflow-hidden transition-all"
                style={{
                  border: selectedPhoto?.id === photo.id ? '3px solid var(--accent)' : '2px solid transparent',
                  boxShadow: selectedPhoto?.id === photo.id ? '0 0 12px rgba(255,107,107,0.3)' : 'none',
                }}
              >
                <img src={photo.thumbUrl} alt={photo.alt} className="w-full h-full object-cover" />
                {selectedPhoto?.id === photo.id && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <span className="text-xs" style={{ color: 'var(--accent)' }}>✓</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          {selectedPhoto && (
            <p className="text-[10px] mt-2" style={{ color: 'var(--muted-light)' }}>
              Foto di {selectedPhoto.credit} su Unsplash
            </p>
          )}
        </div>
      )}

      {/* Confirm button */}
      {selectedPhoto && (
        <button
          onClick={handleConfirm}
          className="w-full mt-4 py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] animate-fade-in"
          style={{ background: 'var(--accent)', boxShadow: '0 4px 12px rgba(255,107,107,0.25)' }}
        >
          <Plus size={16} /> Aggiungi &quot;{query}&quot;
        </button>
      )}
    </div>
  )
}
