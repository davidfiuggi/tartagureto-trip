'use client'

import { Member } from '@/lib/types'
import { Crown } from 'lucide-react'

interface Props {
  members: Member[]
  currentMemberId: string
}

export default function MembersList({ members, currentMemberId }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map((m, i) => (
        <div key={m.id}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium animate-slide-in"
          style={{
            background: m.id === currentMemberId ? 'var(--accent-light)' : 'var(--card)',
            border: m.id === currentMemberId ? '1.5px solid var(--accent)' : '1px solid var(--border)',
            animationDelay: `${i * 0.04}s`, opacity: 0,
          }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: m.avatar_color }}>
            {m.name[0].toUpperCase()}
          </div>
          <span style={{ color: 'var(--foreground)' }}>{m.name}</span>
          {m.is_admin && <Crown size={12} style={{ color: 'var(--orange)' }} />}
          {m.id === currentMemberId && <span className="text-[10px]" style={{ color: 'var(--accent)' }}>you</span>}
        </div>
      ))}
    </div>
  )
}
