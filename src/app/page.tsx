import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import HomeClient from '@/components/HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const { data: memberRows } = await supabase
    .from('group_members')
    .select('group_id, role, groups(id, name, description, invite_code, created_at)')
    .eq('user_id', user.id)

  const groups = (memberRows ?? []).map(r => ({
    ...(r.groups as any),
    myRole: r.role,
  }))

  return (
    <>
      <Navbar profile={profile} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <HomeClient profile={profile} initialGroups={groups} />
      </main>
    </>
  )
}
