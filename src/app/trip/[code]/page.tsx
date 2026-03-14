'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trip, Member, ProposalWithVotes, ProposalType } from '@/lib/types'
import { getSession, PROPOSAL_LABELS } from '@/lib/utils'
import ProposalCard from '@/components/ProposalCard'
import AddProposal from '@/components/AddProposal'
import MembersList from '@/components/MembersList'
import ShareButton from '@/components/ShareButton'
import Summary from '@/components/Summary'

const TABS: ProposalType[] = ['destination', 'date', 'budget', 'activity']

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
          <div className="animate-float text-4xl mb-3">🐢</div>
          <p className="text-muted text-sm">Loading trip...</p>
        </div>
      </div>
    )
  }

  const filtered = proposals.filter(p => p.type === activeTab).sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="glass border-b border-white/5 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <span className="text-lg">🐢</span>
            </div>
            <div>
              <h1 className="text-base font-bold">{trip.name}</h1>
              <p className="text-muted text-[11px] font-mono tracking-wider">{trip.code}</p>
            </div>
          </div>
          <button onClick={() => router.push(`/admin/${code}`)}
            className="text-xs text-muted hover:text-white transition px-3 py-2 rounded-xl glass">
            Admin
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-5">
        {/* Share */}
        <div className="animate-fade-up">
          <ShareButton code={trip.code} tripName={trip.name} />
        </div>

        {/* Members */}
        <div className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <p className="text-xs text-muted uppercase tracking-wider mb-2 font-medium">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
          <MembersList members={members} currentMemberId={session.memberId} />
        </div>

        {/* Summary toggle */}
        <button onClick={() => setShowSummary(!showSummary)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-2xl glass text-sm font-medium transition animate-fade-up"
          style={{ animationDelay: '0.15s', opacity: 0 }}>
          <span className="flex items-center gap-2">
            <span>🏆</span> {showSummary ? 'Hide Summary' : 'Show Summary'}
          </span>
          <span className="text-muted text-xs">{showSummary ? '▲' : '▼'}</span>
        </button>

        {showSummary && <Summary proposals={proposals} />}

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-2xl p-1.5 animate-fade-up"
          style={{ animationDelay: '0.2s', opacity: 0 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                activeTab === tab ? 'tab-active text-white' : 'text-muted hover:text-white'
              }`}>
              {PROPOSAL_LABELS[tab].emoji} {PROPOSAL_LABELS[tab].label}
            </button>
          ))}
        </div>

        {/* Proposals */}
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <ProposalCard key={p.id} proposal={p} memberId={session.memberId} onVoted={loadData} rank={i} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 animate-fade-up">
              <div className="text-3xl mb-2 animate-float">{PROPOSAL_LABELS[activeTab].emoji}</div>
              <p className="text-muted text-sm">No proposals yet</p>
              <p className="text-muted/50 text-xs mt-1">Be the first to add one!</p>
            </div>
          )}
          <AddProposal tripId={trip.id} memberId={session.memberId} type={activeTab} onAdded={loadData} />
        </div>
      </div>
    </div>
  )
}
