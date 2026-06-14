'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight, Crown, Shield, Users } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import CreateGroupModal from '@/components/groups/CreateGroupModal'
import { getGroupAvatarUrl } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface GroupItem {
  id: string
  name: string
  description: string | null
  invite_code: string
  avatar_id: number
  created_at: string
  myRole: string
}

interface Props {
  profile: Profile
  initialGroups: GroupItem[]
}

export default function HomeClient({ profile, initialGroups }: Props) {
  const [groups, setGroups] = useState(initialGroups)
  const [showCreate, setShowCreate] = useState(false)
  const supabase = createClient()

  async function refreshGroups() {
    const { data: memberRows } = await supabase
      .from('group_members')
      .select('group_id, role, groups(id, name, description, invite_code, created_at)')
      .eq('user_id', profile.id)
    if (memberRows) {
      setGroups(memberRows.map(r => ({ ...(r.groups as any), myRole: r.role })))
    }
  }

  const roleIcon = (role: string) => {
    if (role === 'owner') return <Crown className="w-3 h-3 text-accent" />
    if (role === 'admin') return <Shield className="w-3 h-3 text-muted" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Gruplar</h1>
          <p className="text-muted text-sm mt-0.5">@{profile.username}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="accent rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition glow-accent"
        >
          <Plus className="w-4 h-4" />
          Yeni grup
        </button>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="bg-surface border border-base rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface2 border border-base flex items-center justify-center mx-auto">
            <Users className="w-5 h-5 text-muted" />
          </div>
          <div>
            <p className="font-semibold text-sm">Henüz bir grubun yok</p>
            <p className="text-muted text-sm mt-1">Bir grup oluştur ya da davet bağlantısıyla katıl.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="accent rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition inline-flex items-center gap-1.5 glow-accent"
          >
            <Plus className="w-4 h-4" />
            Grup oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex items-center gap-4 bg-surface border border-base rounded-2xl px-5 py-4 hover:border-accent/40 hover:bg-surface2 transition-all group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-base">
                <Image src={getGroupAvatarUrl(group.avatar_id || 1)} alt={group.name} width={40} height={40} className="w-full h-full" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {roleIcon(group.myRole)}
                  <span className="font-semibold text-sm truncate">{group.name}</span>
                </div>
                {group.description ? (
                  <p className="text-muted text-xs mt-0.5 truncate">{group.description}</p>
                ) : (
                  <p className="text-muted text-xs mt-0.5">{new Date(group.created_at).toLocaleDateString('tr-TR')} kuruldu</p>
                )}
              </div>

              <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal
          userId={profile.id}
          onCreated={refreshGroups}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
