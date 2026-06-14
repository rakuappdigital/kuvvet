'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils'
import type { Activity, ActivityResponse, Profile } from '@/types/database'

type ResponseType = 'geliyor' | 'gelmiyor' | 'bilemiyorum'

const RESPONSES: { value: ResponseType; label: string; emoji: string; active: string; border: string }[] = [
  { value: 'geliyor',     label: 'Geliyorum',   emoji: '✅', active: 'bg-green-500/15 border-green-500/40 text-green-400',  border: 'border-base' },
  { value: 'gelmiyor',    label: 'Gelmiyorum',  emoji: '❌', active: 'bg-red-500/15 border-red-500/40 text-red-400',       border: 'border-base' },
  { value: 'bilemiyorum', label: 'Bilemiyorum', emoji: '🤷', active: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400', border: 'border-base' },
]

interface ActivityWithProfile extends Activity {
  profiles: { username: string; avatar_id: number }
}

interface ResponseWithProfile extends ActivityResponse {
  profiles: { username: string; avatar_id: number }
}

interface Props {
  activity: ActivityWithProfile
  currentProfile: Profile
  canDelete: boolean
  onDeleted: (id: string) => void
}

export default function ActivityCard({ activity, currentProfile, canDelete, onDeleted }: Props) {
  const [responses, setResponses] = useState<ResponseWithProfile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const myResponse = responses.find(r => r.user_id === currentProfile.id)

  useEffect(() => {
    fetchResponses()
    const channel = supabase
      .channel(`activity:${activity.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_responses', filter: `activity_id=eq.${activity.id}` },
        () => fetchResponses())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.id])

  async function fetchResponses() {
    const { data } = await supabase
      .from('activity_responses')
      .select('*, profiles(username, avatar_id)')
      .eq('activity_id', activity.id)
    if (data) setResponses(data as any)
  }

  async function handleResponse(val: ResponseType) {
    if (submitting) return
    setSubmitting(true)

    if (myResponse?.response === val) {
      // Aynı butona tekrar basarsa kaldır
      await supabase.from('activity_responses').delete()
        .eq('activity_id', activity.id).eq('user_id', currentProfile.id)
    } else if (myResponse) {
      // Farklı cevap → güncelle
      await supabase.from('activity_responses')
        .update({ response: val })
        .eq('activity_id', activity.id).eq('user_id', currentProfile.id)
    } else {
      await supabase.from('activity_responses').insert({
        activity_id: activity.id,
        user_id: currentProfile.id,
        response: val,
      })
    }
    setSubmitting(false)
  }

  async function handleDelete() {
    await supabase.from('activities').delete().eq('id', activity.id)
    onDeleted(activity.id)
  }

  const countFor = (val: ResponseType) => responses.filter(r => r.response === val).length

  return (
    <div className="bg-surface border border-base rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-start gap-3">
        <Avatar avatarId={activity.profiles.avatar_id} username={activity.profiles.username} size={34} className="ring-1 ring-border flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold">@{activity.profiles.username}</span>
            <span className="text-xs text-muted">{formatRelativeTime(activity.created_at)}</span>
          </div>
          <p className="text-sm leading-relaxed">{activity.title}</p>
        </div>
        {canDelete && (
          <button onClick={handleDelete} className="text-muted hover:text-red-400 transition p-1 flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cevap butonları */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-2">
        {RESPONSES.map(r => {
          const count = countFor(r.value)
          const isActive = myResponse?.response === r.value
          return (
            <button
              key={r.value}
              onClick={() => handleResponse(r.value)}
              disabled={submitting}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition ${
                isActive ? r.active : 'border-base text-muted hover:bg-surface2 hover:text-accent hover:border-accent/30'
              }`}
            >
              <span className="text-base">{r.emoji}</span>
              <span>{r.label}</span>
              {count > 0 && <span className={`text-[10px] ${isActive ? 'opacity-80' : 'text-muted'}`}>{count} kişi</span>}
            </button>
          )
        })}
      </div>

      {/* Katılımcı avatarları */}
      {responses.length > 0 && (
        <div className="px-5 pb-4 border-t border-base pt-3 flex items-center gap-2 flex-wrap">
          {(['geliyor', 'gelmiyor', 'bilemiyorum'] as ResponseType[]).map(rv => {
            const group = responses.filter(r => r.response === rv)
            if (group.length === 0) return null
            const cfg = RESPONSES.find(r => r.value === rv)!
            return (
              <div key={rv} className="flex items-center gap-1.5">
                <span className="text-xs">{cfg.emoji}</span>
                <div className="flex -space-x-1.5">
                  {group.slice(0, 5).map(r => (
                    <Avatar key={r.user_id} avatarId={r.profiles.avatar_id} username={r.profiles.username} size={20} className="ring-1 ring-surface" />
                  ))}
                  {group.length > 5 && <span className="text-[10px] text-muted ml-2">+{group.length - 5}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
