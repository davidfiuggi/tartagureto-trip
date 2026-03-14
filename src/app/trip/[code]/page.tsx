'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trip, Member, ProposalWithVotes, ProposalType } from '@/lib/types'
import { getSession, PROPOSAL_LABELS } from '@/lib/utils'
import ProposalCard from '@/components/ProposalCard'
import AddProposal from '@/components/AddProposal'
import MembersList from '@/components/MembersList'

const TABS: ProposalType[] = ['destination', 'date', 'budget', 'activity']

export default function TripPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [proposals, setProposals] = useState<ProposalWithVotes[]>([])
  const [activeTab, setActiveTab] = useState<ProposalType>('destination')
  const [session, setSessionState] = useState<{ memberId: string; memberName: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const { data: tripData } = await supabase
      .from('trips')
      .select()
      .eq('code', code)
      .single()

    if (!tripData) { router.push('/'); return }
    setTrip(tripData)

    const { data: membersData } = await supabase
      .from('members')
      .select()
      .eq('trip_id', tripData.id)
      .order('created_at')

    setMembers(membersData || [])

    const { data: proposalsData } = await supabase
      .from('proposals')
      .select('*, votes(*)')
      .eq('trip_id', tripData.id)
      .order('created_at')

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
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  const filtered = proposals
    .filter(p => p.type === activeTab)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span>🐢</span> {trip.name}
            </h1>
            <p className="text-muted text-xs mt-0.5">
              Code: <span className="font-mono tracking-wider">{trip.code}</span>
            </p>
          </div>
          <button
            onClick={() => router.push(`/admin/${code}`)}
            className="text-xs text-muted hover:text-white transition px-3 py-1.5 rounded-lg border border-border"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Members */}
        <MembersList members={members} currentMemberId={session.memberId} />

        {/* Tabs */}
        <div className="flex gap-1 bg-card rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === tab
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-white'
              }`}
            >
              {PROPOSAL_LABELS[tab].emoji} {PROPOSAL_LABELS[tab].label}
            </button>
          ))}
        </div>

        {/* Proposals */}
        <div className="space-y-3">
          {filtered.map(p => (
            <ProposalCard
              key={p.id}
              proposal={p}
              memberId={session.memberId}
              onVoted={loadData}
            />
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-muted text-sm py-8">
              No proposals yet. Be the first!
            </p>
          )}

          <AddProposal
            tripId={trip.id}
            memberId={session.memberId}
            type={activeTab}
            onAdded={loadData}
          />
        </div>
      </div>
    </div>
  )
}
