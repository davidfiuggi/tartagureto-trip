export interface Trip {
  id: string
  name: string
  code: string
  admin_password: string
  created_at: string
}

export interface Member {
  id: string
  trip_id: string
  name: string
  avatar_color: string
  is_admin: boolean
  created_at: string
}

export interface Proposal {
  id: string
  trip_id: string
  member_id: string
  type: 'destination' | 'date' | 'budget' | 'activity'
  title: string
  description: string | null
  created_at: string
}

export interface Vote {
  id: string
  proposal_id: string
  member_id: string
  vote: 1 | -1
  created_at: string
}

export interface ProposalWithVotes extends Proposal {
  votes: Vote[]
  member_name: string
  score: number
}

export type ProposalType = Proposal['type']
