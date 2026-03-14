'use client'

import { Member } from '@/lib/types'

interface Props {
  members: Member[]
  currentMemberId: string
}

export default function MembersList({ members, currentMemberId }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map((m, i) => (
        <div key={m.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium glass animate-slide-in ${
            m.id === currentMemberId ? 'border-accent/40' : ''
          }`}
          style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${m.avatar_color}, ${m.avatar_color}88)` }}>
            {m.name[0].toUpperCase()}
          </div>
          <span>{m.name}</span>
          {m.is_admin && <span className="text-gold text-[10px]">&#9733;</span>}
          {m.id === currentMemberId && <span className="text-accent text-[10px]">(you)</span>}
        </div>
      ))}
    </div>
  )
}
