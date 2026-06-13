'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CreateGroupModal from '@/components/groups/CreateGroupModal'
import type { Profile } from '@/types/database'

interface GroupItem {
  id: string
  name: string
  description: string | null
  invite_code: string
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gruplarım</h1>
          <p className="text-muted text-sm mt-0.5">@{profile.username}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="accent rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition"
        >
          + Yeni Grup
        </button>
      </div>

      {/* Groups grid */}
      {groups.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-base">
          <div className="text-5xl mb-4">🤝</div>
          <p className="font-semibold mb-2">Henüz bir grubun yok</p>
          <p className="text-muted text-sm mb-6">Bir grup oluştur ya da davet bağlantısıyla katıl.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="accent rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
          >
            Grup Oluştur
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="bg-surface border border-base rounded-2xl p-5 hover:border-accent transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-bold text-base group-hover:text-accent transition-colors">{group.name}</h2>
                {group.myRole === 'owner' && (
                  <span className="text-xs bg-surface2 text-muted px-2 py-0.5 rounded-full">Sahibi</span>
                )}
                {group.myRole === 'admin' && (
                  <span className="text-xs bg-surface2 text-muted px-2 py-0.5 rounded-full">Admin</span>
                )}
              </div>
              {group.description && (
                <p className="text-sm text-muted line-clamp-2">{group.description}</p>
              )}
              <p className="text-xs text-muted mt-3">
                {new Date(group.created_at).toLocaleDateString('tr-TR')} tarihinde kuruldu
              </p>
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
