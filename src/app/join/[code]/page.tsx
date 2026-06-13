import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ code: string }>
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/join/${code}`)

  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const groupResult = await supabase.from('groups').select('id').eq('invite_code', code).maybeSingle()
  const group = groupResult.data as { id: string } | null
  if (!group) redirect('/?error=invalid_invite')

  // Check already member
  const existingResult = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const groupId = group.id

  if (!existingResult.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('group_members').insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member',
    })
  }

  redirect(`/groups/${groupId}`)
}
