// Simplified types - using loose typing to avoid Supabase generic conflicts

export type MemberRole = 'owner' | 'admin' | 'member'

export interface Profile {
  id: string
  username: string
  avatar_id: number
  bio: string | null
  status: string | null
  created_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  created_by: string | null
  invite_code: string
  avatar_id: number
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: string
  joined_at: string
}

export interface WallPost {
  id: string
  group_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Poll {
  id: string
  group_id: string
  created_by: string
  question: string
  ends_at: string | null
  allow_multiple: boolean
  created_at: string
}

export interface PollOption {
  id: string
  poll_id: string
  text: string
  position: number
}

export interface PollVote {
  id: string
  poll_id: string
  option_id: string
  user_id: string
  created_at: string
}

export interface MapShare {
  id: string
  group_id: string
  user_id: string
  title: string
  description: string | null
  lat: number
  lng: number
  created_at: string
}

// Supabase client uses this — keep as any to avoid conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any
