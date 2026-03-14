'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trip, Member, ProposalWithVotes, ProposalType } from '@/lib/types'
import { getSession } from '@/lib/utils'
import ProposalCard from '@/components/ProposalCard'
import AddProposal from '@/components/AddProposal'
import MembersList from '@/components/MembersList'
import ShareButton from '@/components/ShareButton'
import Summary from '@/components/Summary'
import { Compass, Settings, MapPin, Calendar, Wallet, Sparkles, Trophy, ChevronDown, ChevronUp } from 'lucide-react'

const TABS: { type: ProposalType; label: string; icon: typeof MapPin }[] = [
  { type: 'destination', label: 'Destinations', icon: MapPin },
  { type: 'date', label: 'Dates', icon: Calendar },
  { type: 'budget', label: 'Budget', icon: Wallet },
  { type: 'activity', label: 'Activities', icon: Sparkles },
]

export default function TripPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [proposals, setProposals] = useState<ProposalWithVotes[]>([])
  const [activeTab, setActiveTab] = useState<ProposalType>('destination')
  const [showSummary, setShowSummary] = useState(false)
  const [session, setSessionState] = useState<{ memberId: string; memberName: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const { data: tripData } = await supabase.from('trips').select().eq('code', code).single()
    if (!tripData) { router.push('/'); return }
    setTrip(tripData)
    const { data: membersData } = await supabase
      .from('members').select().eq('trip_id', tripData.id).order('created_at')
    setMembers(membersData || [])
    const { data: proposalsData } = await supabase
      .from('proposals').select('*, votes(*)').eq('trip_id', tripData.id).order('created_at')
    const enriched: ProposalWithVotes[] = (proposalsData || []).map(p => {
      const member = membersData?.find(m => m.id === p.member_id)
      const votes = p.votes || []
      const score = votes.reduce((sum: number, v: { vote: number }) => sum + v.vote, 0)
      return { ...p, member_name: member?.name || '?', score }
    })
    setProposals(enriched)
    setLoading(false)
  }, [code, router])

  useEffect(() => {
    const s = getSession(code)
    if (!s) { router.push('/'); return }
    setSessionState(s)
    loadData()
  }, [code, router, loadData])

  if (loading || !trip || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <Compass size={32} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--accent)', animationDuration: '2s' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading trip...</p>
        </div>
      </div>
    )
  }

  const filtered = proposals.filter(p => p.type === activeTab).sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-3" style={{ background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              <Compass size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{trip.name}</h1>
              <p className="text-[11px] font-mono tracking-wider" style={{ color: 'var(--muted)' }}>{trip.code}</p>
            </div>
          </div>
          <button onClick={() => router.push(`/admin/${code}`)}
            className="p-2.5 rounded-xl transition hover:bg-gray-100" style={{ border: '1px solid var(--border)' }}>
            <Settings size={16} style={{ color: 'var(--muted)' }} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-4">
        {/* Share */}
        <div className="animate-fade-up"><ShareButton code={trip.code} tripName={trip.name} /></div>

        {/* Members */}
        <div className="animate-fade-up" style={{ animationDelay: '0.08s', opacity: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
          <MembersList members={members} currentMemberId={session.memberId} />
        </div>

        {/* Summary toggle */}
        <button onClick={() => setShowSummary(!showSummary)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-2xl text-sm font-medium transition-all hover:bg-gray-50 animate-fade-up active:scale-[0.99]"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', animationDelay: '0.12s', opacity: 0 }}>
          <span className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Trophy size={16} style={{ color: 'var(--orange)' }} />
            {showSummary ? 'Hide Results' : 'View Current Results'}
          </span>
          {showSummary ? <ChevronUp size={16} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--muted)' }} />}
        </button>

        {showSummary && <Summary proposals={proposals} />}

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 rounded-2xl animate-fade-up"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', animationDelay: '0.16s', opacity: 0 }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.type
            return (
              <button key={tab.type} onClick={() => setActiveTab(tab.type)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--muted)',
                  boxShadow: active ? '0 2px 8px rgba(255,107,107,0.25)' : 'none',
                }}>
                <Icon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Proposals */}
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <ProposalCard key={p.id} proposal={p} memberId={session.memberId} onVoted={loadData} rank={i} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 animate-fade-up">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                style={{ background: 'var(--accent-light)' }}>
                {TABS.find(t => t.type === activeTab)?.icon && (() => {
                  const Icon = TABS.find(t => t.type === activeTab)!.icon
                  return <Icon size={24} style={{ color: 'var(--accent)' }} />
                })()}
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>No proposals yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Be the first to add one!</p>
            </div>
          )}
          <AddProposal tripId={trip.id} memberId={session.memberId} type={activeTab} onAdded={loadData} />
        </div>
      </div>
    </div>
  )
}
