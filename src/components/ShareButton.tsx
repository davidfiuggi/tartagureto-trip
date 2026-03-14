'use client'

import { useState } from 'react'

interface Props {
  code: string
  tripName: string
}

export default function ShareButton({ code, tripName }: Props) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.origin : ''
  const message = `Join our trip "${tripName}" on Tartagureto! 🐢\n\nCode: ${code}\n${url}`

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl glass text-sm font-medium hover:bg-card-hover transition">
        {copied ? (
          <><span className="text-green">&#10003;</span> Copied!</>
        ) : (
          <><span>📋</span> Copy Code</>
        )}
      </button>
      <button onClick={handleWhatsApp}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition"
        style={{ background: 'rgba(37, 211, 102, 0.15)', border: '1px solid rgba(37, 211, 102, 0.25)' }}>
        <span>💬</span> WhatsApp
      </button>
    </div>
  )
}
