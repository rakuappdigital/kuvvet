'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, MessageSquare, BarChart2, Users, Plus, Crown, Shield, Settings } from 'lucide-react'
import Image from 'next/image'
import { getGroupAvatarUrl } from '@/lib/utils'
import Wall from '@/components/wall/Wall'
import PollCard from '@/components/polls/PollCard'
import CreatePollModal from '@/components/polls/CreatePollModal'
import InviteModal from '@/components/groups/InviteModal'
import GroupSettingsModal from '@/components/groups/GroupSettingsModal'
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
  const [showSettings, setShowSettings] = useState(false)
  const [groupData, setGroupData] = useState(group)
  const canManage = _myRole === 'owner' || _myRole === 'admin'
  const supabase = createClient()

  async function refreshPolls() {
    const { data } = await supabase
      .from('polls')
      .select('*, poll_options(*)')
      .eq('group_id', group.id)
      .order('created_at', { ascending: false })
    if (data) setPolls(data as any)
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'wall', label: 'Duvar', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'polls', label: 'Anketler', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { key: 'members', label: 'Üyeler', icon: <Users className="w-3.5 h-3.5" /> },
  ]

  const roleIcon = (role: string) => {
    if (role === 'owner') return <Crown className="w-3.5 h-3.5 text-accent" />
    if (role === 'admin') return <Shield className="w-3.5 h-3.5 text-muted" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          Gruplar
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-base flex-shrink-0">
              <Image src={getGroupAvatarUrl(groupData.avatar_id || 1)} alt={groupData.name} width={48} height={48} className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{groupData.name}</h1>
              {groupData.description && <p className="text-muted text-sm mt-0.5">{groupData.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                onClick={() => setShowSettings(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-base hover:bg-surface2 hover:border-accent/40 text-muted hover:text-accent transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <Button size="sm" onClick={() => setShowInvite(true)}>
              <UserPlus className="w-3.5 h-3.5" />
              Davet et
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl border border-base w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              tab === t.key ? 'accent' : 'text-muted hover:text-accent'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'wall' && (
        <Wall groupId={group.id} currentProfile={currentProfile} />
      )}

      {tab === 'polls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Anketler</h2>
            <Button size="sm" onClick={() => setShowCreatePoll(true)}>
              <Plus className="w-3.5 h-3.5" />
              Anket ekle
            </Button>
          </div>
          {polls.length === 0 ? (
            <div className="bg-surface border border-base rounded-2xl p-10 text-center space-y-3">
              <div className="w-10 h-10 bg-surface2 border border-base rounded-xl flex items-center justify-center mx-auto">
                <BarChart2 className="w-4 h-4 text-muted" />
              </div>
              <p className="text-muted text-sm">Henüz anket yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {polls.map(poll => (
                <PollCard key={poll.id} poll={poll} currentProfile={currentProfile} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'members' && (
        <div className="bg-surface border border-base rounded-2xl overflow-hidden">
          {initialMembers.map((m, i) => (
            <div key={m.profiles.id} className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? 'border-t border-base' : ''}`}>
              <Avatar avatarId={m.profiles.avatar_id} username={m.profiles.username} size={34} className="ring-1 ring-border" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {roleIcon(m.role)}
                  <span className="text-sm font-medium">@{m.profiles.username}</span>
                </div>
                <p className="text-xs text-muted">{new Date(m.joined_at).toLocaleDateString('tr-TR')} katıldı</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInvite && <InviteModal group={groupData} onClose={() => setShowInvite(false)} />}
      {showSettings && (
        <GroupSettingsModal
          group={groupData}
          onClose={() => setShowSettings(false)}
          onUpdated={(updated) => setGroupData(prev => ({ ...prev, ...updated }))}
        />
      )}
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
