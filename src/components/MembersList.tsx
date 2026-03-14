'use client'

import { Member } from '@/lib/types'

interface Props {
  members: Member[]
  currentMemberId: string
}

export default function MembersList({ members, currentMemberId }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map(m => (
        <div
          key={m.id}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            m.id === currentMemberId ? 'border border-accent' : 'border border-border'
          }`}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: m.avatar_color }}
          >
            {m.name[0].toUpperCase()}
          </div>
          <span>{m.name}</span>
          {m.is_admin && <span className="text-muted">admin</span>}
        </div>
      ))}
    </div>
  )
}
