import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ProfileClient from '@/components/ProfileClient'

interface Props {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentProfile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwn = currentProfile?.id === profile.id

  return (
    <>
      {currentProfile && <Navbar profile={currentProfile} />}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <ProfileClient profile={profile} isOwn={isOwn} />
      </main>
    </>
  )
}
