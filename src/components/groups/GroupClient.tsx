'use client'

import { useState } from 'react'
import Link from 'next/link'
import Wall from '@/components/wall/Wall'
import PollCard from '@/components/polls/PollCard'
import CreatePollModal from '@/components/polls/CreatePollModal'
import InviteModal from '@/components/groups/InviteModal'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Group, Profile, Poll, PollOption } from '@/types/database'

type Tab = 'wall' | 'polls' | 'members'

interface Member {
  role: string
  joined_at: string
  profiles: { id: string; username: string; avatar_id: number }
}

interface Props {
  group: Group
  currentProfile: Profile
  myRole: string // reserved for future admin controls
  initialMembers: Member[]
  initialPolls: (Poll & { poll_options: PollOption[] })[]
}

export default function GroupClient({ group, currentProfile, myRole: _myRole, initialMembers, initialPolls }: Props) {
  const [tab, setTab] = useState<Tab>('wall')
  const [polls, setPolls] = useState(initialPolls)
  const [showInvite, setShowInvite] = useState(false)
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const supabase = createClient()

  async function refreshPolls() {
    const { data } = await supabase
      .from('polls')
      .select('*, poll_options(*)')
      .eq('group_id', group.id)
      .order('created_at', { ascending: false })
    if (data) setPolls(data as any)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-accent transition">← Gruplar</Link>
          <h1 className="text-2xl font-bold mt-1">{group.name}</h1>
          {group.description && <p className="text-muted text-sm mt-1">{group.description}</p>}
        </div>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          Davet Et
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl border border-base w-fit">
        {(['wall', 'polls', 'members'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === t ? 'accent' : 'text-muted hover:text-accent'
            }`}
          >
            {t === 'wall' ? 'Duvar' : t === 'polls' ? 'Anketler' : 'Üyeler'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'wall' && (
        <Wall groupId={group.id} currentProfile={currentProfile} />
      )}

      {tab === 'polls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Anketler</h2>
            <Button size="sm" onClick={() => setShowCreatePoll(true)}>+ Anket Ekle</Button>
          </div>
          {polls.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-2xl border border-base">
              <p className="text-muted text-sm">Henüz anket yok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map(poll => (
                <PollCard key={poll.id} poll={poll} currentProfile={currentProfile} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'members' && (
        <div className="bg-surface border border-base rounded-2xl divide-y divide-base">
          {initialMembers.map(m => (
            <div key={m.profiles.id} className="flex items-center gap-3 p-4">
              <Avatar avatarId={m.profiles.avatar_id} username={m.profiles.username} size={36} />
              <div className="flex-1">
                <p className="text-sm font-medium">@{m.profiles.username}</p>
                <p className="text-xs text-muted">{new Date(m.joined_at).toLocaleDateString('tr-TR')} katıldı</p>
              </div>
              {m.role !== 'member' && (
                <span className="text-xs bg-surface2 text-muted px-2 py-0.5 rounded-full capitalize">{m.role === 'owner' ? 'Sahibi' : 'Admin'}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {showInvite && <InviteModal group={group} onClose={() => setShowInvite(false)} />}
      {showCreatePoll && (
        <CreatePollModal
          groupId={group.id}
          userId={currentProfile.id}
          onCreated={refreshPolls}
          onClose={() => setShowCreatePoll(false)}
        />
      )}
    </div>
  )
}
