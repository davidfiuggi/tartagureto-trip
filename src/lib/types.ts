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

// Internal vote representation used by components
export interface Vote {
  id: string
  trip_id: string
  member_id: string
  category: 'destination' | 'budget' | 'weekend_type' | 'month'
  option_id: string
  created_at: string
}

export type VoteCategory = Vote['category']

export type Section = 'destinations' | 'budget' | 'when' | 'results'

// DB table types (existing schema)
export interface DbProposal {
  id: string
  trip_id: string
  member_id: string
  type: 'destination' | 'date' | 'budget' | 'activity'
  title: string
  description: string | null
  created_at: string
  votes?: DbVote[]
}

export interface DbVote {
  id: string
  proposal_id: string
  member_id: string
  vote: number
  created_at: string
}

// Map our categories to the DB proposal type field
export const CATEGORY_TO_DB_TYPE: Record<string, string> = {
  destination: 'destination',
  budget: 'budget',
  weekend_type: 'date',
  month: 'activity',
}

export const DB_TYPE_TO_CATEGORY: Record<string, string> = {
  destination: 'destination',
  budget: 'budget',
  date: 'weekend_type',
  activity: 'month',
}
