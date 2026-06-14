'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, MessageSquare, BarChart2, Users, Plus, Crown, Shield, Settings, LogOut, CalendarCheck } from 'lucide-react'
import Image from 'next/image'
import { getGroupAvatarUrl } from '@/lib/utils'
import Wall from '@/components/wall/Wall'
import PollCard from '@/components/polls/PollCard'
import CreatePollModal from '@/components/polls/CreatePollModal'
import InviteModal from '@/components/groups/InviteModal'
import GroupSettingsModal from '@/components/groups/GroupSettingsModal'
import MemberProfileModal from '@/components/groups/MemberProfileModal'
import ActivityCard from '@/components/activity/ActivityCard'
import CreateActivityModal from '@/components/activity/CreateActivityModal'
import ArchiveWidget from '@/components/groups/ArchiveWidget'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Group, Profile, Poll, PollOption, Activity } from '@/types/database'

type Tab = 'wall' | 'polls' | 'activity' | 'members'

interface Member {
  role: string
  joined_at: string
  profiles: { id: string; username: string; avatar_id: number }
}

interface ActivityWithProfile extends Activity {
  profiles: { username: string; avatar_id: number }
}

interface Props {
  group: Group
  currentProfile: Profile
  myRole: string
  initialMembers: Member[]
  initialPolls: (Poll & { poll_options: PollOption[] })[]
  initialActivities: ActivityWithProfile[]
}

export default function GroupClient({ group, currentProfile, myRole: _myRole, initialMembers, initialPolls, initialActivities }: Props) {
  const [tab, setTab] = useState<Tab>('wall')
  const [polls, setPolls] = useState(initialPolls)
  const [activities, setActivities] = useState(initialActivities)

  const now = Date.now()
  const EXPIRY = 24 * 60 * 60 * 1000
  const activePolls = polls.filter(p => {
    const exp = p.ends_at ? new Date(p.ends_at).getTime() : new Date(p.created_at).getTime() + EXPIRY
    return exp > now
  })
  const expiredPolls = polls.filter(p => {
    const exp = p.ends_at ? new Date(p.ends_at).getTime() : new Date(p.created_at).getTime() + EXPIRY
    return exp <= now
  })
  const activeActivities = activities.filter(a => new Date(a.created_at).getTime() + EXPIRY > now)
  const pastActivities = activities.filter(a => new Date(a.created_at).getTime() + EXPIRY <= now)
  const [showInvite, setShowInvite] = useState(false)
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [showCreateActivity, setShowCreateActivity] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [groupData, setGroupData] = useState(group)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const canManage = _myRole === 'owner' || _myRole === 'admin'
  const canLeave = _myRole === 'member'
  const supabase = createClient()

  async function handleLeave() {
    await supabase.from('group_members').delete()
      .eq('group_id', group.id).eq('user_id', currentProfile.id)
    window.location.href = '/'
  }

  async function refreshPolls() {
    const { data } = await supabase.from('polls').select('*, poll_options(*)')
      .eq('group_id', group.id).order('created_at', { ascending: false })
    if (data) setPolls(data as any)
  }

  async function refreshActivities() {
    const { data } = await supabase
      .from('activities')
      .select('*, profiles(username, avatar_id)')
      .eq('group_id', group.id)
      .order('created_at', { ascending: false })
    if (data) setActivities(data as any)
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'wall',     label: 'Duvar',     icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'polls',    label: 'Anketler',  icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { key: 'activity', label: 'Aktivite',  icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { key: 'members',  label: 'Üyeler',    icon: <Users className="w-3.5 h-3.5" /> },
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
            {canLeave && !showLeaveConfirm && (
              <button onClick={() => setShowLeaveConfirm(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-base hover:bg-red-500/10 hover:border-red-500/30 text-muted hover:text-red-400 transition"
                title="Gruptan ayrıl">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            {canLeave && showLeaveConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Emin misin?</span>
                <button onClick={handleLeave} className="text-xs text-red-400 hover:text-red-300 font-semibold">Ayrıl</button>
                <button onClick={() => setShowLeaveConfirm(false)} className="text-xs text-muted hover:text-accent">İptal</button>
              </div>
            )}
            {canManage && (
              <button onClick={() => setShowSettings(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-base hover:bg-surface2 hover:border-accent/40 text-muted hover:text-accent transition">
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

      {/* Tabs — yatay scroll küçük ekranda */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl border border-base overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap flex-shrink-0 ${
              tab === t.key ? 'accent' : 'text-muted hover:text-accent'
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'wall' && <Wall groupId={group.id} currentProfile={currentProfile} />}

      {tab === 'polls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Anketler</h2>
            <Button size="sm" onClick={() => setShowCreatePoll(true)}>
              <Plus className="w-3.5 h-3.5" />Anket ekle
            </Button>
          </div>
          {activePolls.length === 0 ? (
            <div className="bg-surface border border-base rounded-2xl p-10 text-center space-y-3">
              <div className="w-10 h-10 bg-surface2 border border-base rounded-xl flex items-center justify-center mx-auto">
                <BarChart2 className="w-4 h-4 text-muted" />
              </div>
              <p className="text-muted text-sm">Henüz aktif anket yok.</p>
              {expiredPolls.length > 0 && <p className="text-xs text-muted">{expiredPolls.length} anket sona erdi — sağ alttaki kutucuğa bak.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {activePolls.map(poll => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  currentProfile={currentProfile}
                  canDelete={poll.created_by === currentProfile.id || canManage}
                  onDeleted={id => setPolls(prev => prev.filter(x => x.id !== id))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Aktiviteler</h2>
            <Button size="sm" onClick={() => setShowCreateActivity(true)}>
              <Plus className="w-3.5 h-3.5" />Aktivite ekle
            </Button>
          </div>
          {activeActivities.length === 0 ? (
            <div className="bg-surface border border-base rounded-2xl p-10 text-center space-y-3">
              <div className="w-10 h-10 bg-surface2 border border-base rounded-xl flex items-center justify-center mx-auto">
                <CalendarCheck className="w-4 h-4 text-muted" />
              </div>
              <p className="text-muted text-sm">Henüz aktif aktivite yok.</p>
              {pastActivities.length > 0
                ? <p className="text-xs text-muted">{pastActivities.length} aktivite geçti — sağ alttaki kutucuğa bak.</p>
                : <p className="text-xs text-muted">Bir buluşma veya etkinlik oluştur, üyeler katılıp katılmayacaklarını belirtsin.</p>
              }
            </div>
          ) : (
            <div className="space-y-3">
              {activeActivities.map(a => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  currentProfile={currentProfile}
                  canDelete={a.created_by === currentProfile.id || canManage}
                  onDeleted={id => setActivities(prev => prev.filter(x => x.id !== id))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'members' && (
        <div className="bg-surface border border-base rounded-2xl overflow-hidden">
          {initialMembers.map((m, i) => (
            <button
              key={m.profiles.id}
              onClick={() => setSelectedMember(m)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-surface2 transition ${i > 0 ? 'border-t border-base' : ''}`}
            >
              <Avatar avatarId={m.profiles.avatar_id} username={m.profiles.username} size={34} className="ring-1 ring-border flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {roleIcon(m.role)}
                  <span className="text-sm font-medium">@{m.profiles.username}</span>
                </div>
                <p className="text-xs text-muted">{new Date(m.joined_at).toLocaleDateString('tr-TR')} katıldı</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedMember && (
        <MemberProfileModal
          username={selectedMember.profiles.username}
          avatarId={selectedMember.profiles.avatar_id}
          role={selectedMember.role}
          joinedAt={selectedMember.joined_at}
          onClose={() => setSelectedMember(null)}
        />
      )}

      <ArchiveWidget
        expiredPolls={expiredPolls}
        pastActivities={pastActivities as any}
        currentProfile={currentProfile}
        canManage={canManage}
        onPollDeleted={id => setPolls(prev => prev.filter(x => x.id !== id))}
        onActivityDeleted={id => setActivities(prev => prev.filter(x => x.id !== id))}
      />

      {showInvite && <InviteModal group={groupData} onClose={() => setShowInvite(false)} />}
      {showSettings && (
        <GroupSettingsModal group={groupData} onClose={() => setShowSettings(false)}
          onUpdated={(updated) => setGroupData(prev => ({ ...prev, ...updated }))} />
      )}
      {showCreatePoll && (
        <CreatePollModal groupId={group.id} userId={currentProfile.id}
          onCreated={refreshPolls} onClose={() => setShowCreatePoll(false)} />
      )}
      {showCreateActivity && (
        <CreateActivityModal groupId={group.id} userId={currentProfile.id}
          onCreated={refreshActivities} onClose={() => setShowCreateActivity(false)} />
      )}
    </div>
  )
}
