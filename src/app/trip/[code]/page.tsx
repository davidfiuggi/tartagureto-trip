'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trip, Member, Vote, Section, DbProposal, CATEGORY_TO_DB_TYPE, DB_TYPE_TO_CATEGORY } from '@/lib/types'
import { destinations } from '@/lib/destinations-data'
import { getSession } from '@/lib/utils'
import DestinationCard from '@/components/DestinationCard'
import CustomDestinationCard from '@/components/CustomDestinationCard'
import DestinationModal from '@/components/DestinationModal'
import AddDestination from '@/components/AddDestination'
import BudgetVoting from '@/components/BudgetVoting'
import WhenVoting from '@/components/WhenVoting'
import Results from '@/components/Results'
import MembersList from '@/components/MembersList'
import ShareButton from '@/components/ShareButton'
import { Compass, Settings, MapPin, Wallet, Calendar, Trophy, ArrowRight, ArrowLeft } from 'lucide-react'

const SECTIONS: { id: Section; label: string; icon: typeof MapPin }[] = [
  { id: 'destinations', label: 'Mete', icon: MapPin },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'when', label: 'Quando', icon: Calendar },
  { id: 'results', label: 'Risultati', icon: Trophy },
]

// IDs of predefined destinations (from destinations-data.ts)
const PREDEFINED_IDS = new Set(destinations.map(d => d.id))

export interface CustomDest {
  id: string      // proposal title used as vote option_id
  name: string
  imageUrl: string
}

export default function TripPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [proposals, setProposals] = useState<DbProposal[]>([])
  const [customDests, setCustomDests] = useState<CustomDest[]>([])
  const [activeSection, setActiveSection] = useState<Section>('destinations')
  const [session, setSessionState] = useState<{ memberId: string; memberName: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalDest, setModalDest] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const { data: tripData } = await supabase.from('trips').select().eq('code', code).single()
    if (!tripData) { router.push('/'); return }
    setTrip(tripData)
    const { data: membersData } = await supabase
      .from('members').select().eq('trip_id', tripData.id).order('created_at')
    setMembers(membersData || [])

    const { data: proposalsData } = await supabase
      .from('proposals').select('*, votes(*)').eq('trip_id', tripData.id)
    const dbProposals: DbProposal[] = proposalsData || []
    setProposals(dbProposals)

    // Extract custom destinations (destination proposals not in predefined list)
    const customs: CustomDest[] = dbProposals
      .filter(p => p.type === 'destination' && !PREDEFINED_IDS.has(p.title))
      .map(p => ({
        id: p.title,
        name: p.title,
        imageUrl: p.description || '',
      }))
    setCustomDests(customs)

    // Transform DB proposals+votes into flat Vote[] for components
    const flatVotes: Vote[] = dbProposals.flatMap(p => {
      const category = DB_TYPE_TO_CATEGORY[p.type] || p.type
      return (p.votes || [])
        .filter(v => v.vote === 1)
        .map(v => ({
          id: v.id,
          trip_id: p.trip_id,
          member_id: v.member_id,
          category: category as Vote['category'],
          option_id: p.title,
          created_at: v.created_at,
        }))
    })
    setVotes(flatVotes)
    setLoading(false)
  }, [code, router])

  useEffect(() => {
    const s = getSession(code)
    if (!s) { router.push('/'); return }
    setSessionState(s)
    loadData()
  }, [code, router, loadData])

  async function toggleVote(category: string, optionId: string) {
    if (!trip || !session) return
    const dbType = CATEGORY_TO_DB_TYPE[category] || category

    const existing = proposals.find(p => p.type === dbType && p.title === optionId)
    const proposal = existing ?? (await (async () => {
      const { data } = await supabase
        .from('proposals')
        .insert({ trip_id: trip.id, member_id: session.memberId, type: dbType, title: optionId })
        .select()
        .single()
      return data
    })())
    if (!proposal) return

    const existingVote = votes.find(
      v => v.category === category && v.option_id === optionId && v.member_id === session.memberId,
    )

    if (existingVote) {
      await supabase.from('votes').delete().eq('id', existingVote.id)
    } else {
      await supabase.from('votes').insert({
        proposal_id: proposal.id, member_id: session.memberId, vote: 1,
      })
    }
    loadData()
  }

  async function addCustomDestination(name: string, imageUrl: string) {
    if (!trip || !session) return
    // Create proposal with image URL in description field
    await supabase.from('proposals').insert({
      trip_id: trip.id,
      member_id: session.memberId,
      type: 'destination',
      title: name,
      description: imageUrl,
    })
    loadData()
  }

  function navigateTo(section: Section) {
    setActiveSection(section)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  function getDestVoters(destId: string): string[] {
    return votes
      .filter(v => v.category === 'destination' && v.option_id === destId)
      .map(v => members.find(m => m.id === v.member_id)?.name || '?')
  }

  function hasVotedDest(destId: string): boolean {
    return votes.some(
      v => v.category === 'destination' && v.option_id === destId && v.member_id === session!.memberId,
    )
  }

  const currentIdx = SECTIONS.findIndex(s => s.id === activeSection)
  const prevSection = currentIdx > 0 ? SECTIONS[currentIdx - 1] : null
  const nextSection = currentIdx < SECTIONS.length - 1 ? SECTIONS[currentIdx + 1] : null
  const modalDestination = modalDest ? destinations.find(d => d.id === modalDest) : null

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-3"
        style={{ background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
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
        <div className="animate-fade-up"><ShareButton code={trip.code} tripName={trip.name} /></div>
        <div className="animate-fade-up" style={{ animationDelay: '0.06s', opacity: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
            {members.length} partecipant{members.length !== 1 ? 'i' : 'e'}
          </p>
          <MembersList members={members} currentMemberId={session.memberId} />
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 p-1.5 rounded-2xl animate-fade-up"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', animationDelay: '0.12s', opacity: 0 }}>
          {SECTIONS.map(s => {
            const Icon = s.icon
            const active = activeSection === s.id
            return (
              <button key={s.id} onClick={() => navigateTo(s.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--muted)',
                  boxShadow: active ? '0 2px 8px rgba(255,107,107,0.25)' : 'none',
                }}>
                <Icon size={14} /> {s.label}
              </button>
            )
          })}
        </div>

        {/* Current voter */}
        <div className="rounded-xl px-4 py-2.5 animate-fade-up flex items-center gap-2"
          style={{ background: 'var(--accent-light)', border: '1px solid var(--border)', animationDelay: '0.16s', opacity: 0 }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: members.find(m => m.id === session.memberId)?.avatar_color || 'var(--accent)' }}>
            {session.memberName[0].toUpperCase()}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
            Stai votando come <strong>{session.memberName}</strong>
          </span>
        </div>

        {/* Section content */}
        {activeSection === 'destinations' && (
          <div className="space-y-3">
            <div className="text-center mb-2 animate-fade-up">
              <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Le Possibilita</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Vota tutte le mete che ti interessano!</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Predefined destinations */}
              {destinations.map((dest, i) => (
                <DestinationCard key={dest.id} destination={dest}
                  voters={getDestVoters(dest.id)} hasVoted={hasVotedDest(dest.id)}
                  onToggle={() => toggleVote('destination', dest.id)}
                  onShowDetails={() => setModalDest(dest.id)} index={i} />
              ))}
              {/* Custom destinations */}
              {customDests.map((cd, i) => (
                <CustomDestinationCard key={cd.id} name={cd.name} imageUrl={cd.imageUrl}
                  voters={getDestVoters(cd.id)} hasVoted={hasVotedDest(cd.id)}
                  onToggle={() => toggleVote('destination', cd.id)}
                  index={destinations.length + i} />
              ))}
            </div>
            <AddDestination onAdd={addCustomDestination} />
          </div>
        )}

        {activeSection === 'budget' && (
          <BudgetVoting votes={votes} members={members} memberId={session.memberId}
            onToggle={id => toggleVote('budget', id)} />
        )}

        {activeSection === 'when' && (
          <WhenVoting votes={votes} members={members} memberId={session.memberId}
            onToggleWeekend={id => toggleVote('weekend_type', id)}
            onToggleMonth={id => toggleVote('month', id)} />
        )}

        {activeSection === 'results' && (
          <Results votes={votes} members={members} customDests={customDests} />
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {prevSection && (
            <button onClick={() => navigateTo(prevSection.id)}
              className="flex-1 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-gray-50 active:scale-[0.98]"
              style={{ border: '1.5px solid var(--border)', color: 'var(--muted)' }}>
              <ArrowLeft size={14} /> {prevSection.label}
            </button>
          )}
          {nextSection && (
            <button onClick={() => navigateTo(nextSection.id)}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 12px rgba(255,107,107,0.25)' }}>
              {nextSection.label} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {modalDestination && (
        <DestinationModal destination={modalDestination} onClose={() => setModalDest(null)} />
      )}
    </div>
  )
}
