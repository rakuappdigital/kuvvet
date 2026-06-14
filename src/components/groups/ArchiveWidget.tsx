'use client'

import { useState } from 'react'
import { Clock, X, BarChart2, CalendarCheck } from 'lucide-react'
import PollCard from '@/components/polls/PollCard'
import ActivityCard from '@/components/activity/ActivityCard'
import type { Poll, PollOption, Profile } from '@/types/database'

interface ActivityWithProfile {
  id: string
  group_id: string
  created_by: string
  title: string
  event_at: string | null
  created_at: string
  profiles: { username: string; avatar_id: number }
}

interface Props {
  expiredPolls: (Poll & { poll_options: PollOption[] })[]
  pastActivities: ActivityWithProfile[]
  currentProfile: Profile
}

export default function ArchiveWidget({ expiredPolls, pastActivities, currentProfile }: Props) {
  const [open, setOpen] = useState(false)
  const count = expiredPolls.length + pastActivities.length
  if (count === 0) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-surface border border-base rounded-xl shadow-xl hover:border-accent/40 hover:text-accent text-muted text-xs font-semibold transition group"
      >
        <Clock className="w-3.5 h-3.5 group-hover:text-accent transition" />
        <span>{count} bitti</span>
        <span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center">{count}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border border-base rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-base flex-shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted" />
                <h2 className="font-semibold text-sm">Süresi Bitenler</h2>
                <span className="text-xs text-muted">· {count} öğe</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-6">
              {expiredPolls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <BarChart2 className="w-3.5 h-3.5 text-muted" />
                    <span className="text-xs font-semibold text-muted uppercase tracking-widest">Anketler</span>
                    <span className="text-xs text-muted">({expiredPolls.length})</span>
                  </div>
                  {expiredPolls.map(poll => (
                    <PollCard key={poll.id} poll={poll} currentProfile={currentProfile} />
                  ))}
                </div>
              )}

              {pastActivities.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <CalendarCheck className="w-3.5 h-3.5 text-muted" />
                    <span className="text-xs font-semibold text-muted uppercase tracking-widest">Aktiviteler</span>
                    <span className="text-xs text-muted">({pastActivities.length})</span>
                  </div>
                  {pastActivities.map(a => (
                    <ActivityCard
                      key={a.id}
                      activity={a}
                      currentProfile={currentProfile}
                      canDelete={false}
                      onDeleted={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
