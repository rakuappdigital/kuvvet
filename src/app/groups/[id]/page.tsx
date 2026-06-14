import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import GroupClient from '@/components/groups/GroupClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function GroupPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { data: group } = await supabase.from('groups').select('*').eq('id', id).single()
  if (!group) notFound()

  const membershipResult = await supabase
    .from('group_members').select('role').eq('group_id', id).eq('user_id', user.id).maybeSingle()
  const membership = membershipResult.data as { role: string } | null
  if (!membership) redirect('/')

  const [{ data: members }, { data: polls }, { data: activities }] = await Promise.all([
    supabase.from('group_members').select('role, joined_at, profiles(id, username, avatar_id)').eq('group_id', id),
    supabase.from('polls').select('*, poll_options(*)').eq('group_id', id).order('created_at', { ascending: false }),
    supabase.from('activities').select('*, profiles(username, avatar_id)').eq('group_id', id).order('created_at', { ascending: false }),
  ])

  return (
    <>
      <Navbar profile={profile} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <GroupClient
          group={group}
          currentProfile={profile}
          myRole={membership.role}
          initialMembers={(members ?? []) as any}
          initialPolls={(polls ?? []) as any}
          initialActivities={(activities ?? []) as any}
        />
      </main>
    </>
  )
}
