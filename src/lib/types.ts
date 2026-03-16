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
