'use client'

import { useState, useEffect } from 'react'
import { Clock, Users2, ToggleLeft, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import type { Poll, PollOption, PollVote, Profile } from '@/types/database'

const PRIORITY = {
  normal:  { label: 'Normal',  dot: 'bg-green-400',  text: 'text-green-400'  },
  acil:    { label: 'Acil',    dot: 'bg-yellow-400', text: 'text-yellow-400' },
  kritik:  { label: 'Kritik',  dot: 'bg-red-400',    text: 'text-red-400'   },
}

interface Props {
  poll: Poll & { poll_options: PollOption[] }
  currentProfile: Profile
  canDelete?: boolean
  onDeleted?: (id: string) => void
}

export default function PollCard({ poll, currentProfile, canDelete, onDeleted }: Props) {
  const [votes, setVotes] = useState<PollVote[]>([])
  const [voting, setVoting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  const isExpired = poll.ends_at ? new Date(poll.ends_at) < new Date() : false
  const myVotes = votes.filter(v => v.user_id === currentProfile.id).map(v => v.option_id)
  const hasVoted = myVotes.length > 0
  const totalVotes = votes.length
  const uniqueVoters = new Set(votes.map(v => v.user_id)).size
  const priority = PRIORITY[poll.priority] ?? PRIORITY.normal

  useEffect(() => {
    fetchVotes()
    const channel = supabase
      .channel(`poll:${poll.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes', filter: `poll_id=eq.${poll.id}` }, () => fetchVotes())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.id])

  async function fetchVotes() {
    const { data } = await supabase.from('poll_votes').select('*').eq('poll_id', poll.id)
    if (data) setVotes(data)
  }

  async function handleVote(optionId: string) {
    // Zaten oy verdiyse kilitle
    if (voting || isExpired || hasVoted) return
    setVoting(true)

    if (poll.allow_multiple) {
      await supabase.from('poll_votes').insert({ poll_id: poll.id, option_id: optionId, user_id: currentProfile.id })
    } else {
      await supabase.from('poll_votes').insert({ poll_id: poll.id, option_id: optionId, user_id: currentProfile.id })
    }
    setVoting(false)
  }

  function getVoteCount(optionId: string) {
    return votes.filter(v => v.option_id === optionId).length
  }

  function getPercent(optionId: string) {
    if (totalVotes === 0) return 0
    return Math.round((getVoteCount(optionId) / totalVotes) * 100)
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('poll_votes').delete().eq('poll_id', poll.id)
    await supabase.from('poll_options').delete().eq('poll_id', poll.id)
    await supabase.from('polls').delete().eq('id', poll.id)
    onDeleted?.(poll.id)
  }

  return (
    <div className="bg-surface border border-base rounded-2xl overflow-hidden">
      {/* Üst bant: tarih + öncelik + sil */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-base bg-surface2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priority.dot}`} />
          <span className={`text-xs font-semibold ${priority.text}`}>{priority.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{formatRelativeTime(poll.created_at)}</span>
          {canDelete && !deleteConfirm && (
            <button onClick={() => setDeleteConfirm(true)} className="text-muted hover:text-red-400 transition p-0.5">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && deleteConfirm && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <button type="button" onClick={() => setDeleteConfirm(false)} className="text-xs text-muted hover:text-accent transition">Vazgeç</button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg px-2.5 py-1 transition disabled:opacity-50 flex items-center gap-1"
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sil'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Soru */}
        <div className="flex items-start gap-3">
          <p className="font-semibold text-sm leading-snug flex-1">{poll.question}</p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isExpired && (
              <span className="inline-flex items-center gap-1 text-xs text-muted bg-surface2 border border-base px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Sona erdi
              </span>
            )}
            {poll.allow_multiple && (
              <span className="inline-flex items-center gap-1 text-xs text-muted bg-surface2 border border-base px-2 py-0.5 rounded-full">
                <ToggleLeft className="w-3 h-3" />
                Çoklu
              </span>
            )}
          </div>
        </div>

        {/* Seçenekler */}
        <div className="space-y-2">
          {poll.poll_options
            .sort((a, b) => a.position - b.position)
            .map(option => {
              const voted = myVotes.includes(option.id)
              const percent = getPercent(option.id)
              const count = getVoteCount(option.id)
              const locked = hasVoted || isExpired

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={locked || voting}
                  className={`w-full text-left relative overflow-hidden rounded-xl border transition-all duration-150 ${
                    locked ? 'cursor-default' : 'hover:border-accent/50 cursor-pointer'
                  }`}
                  style={{ borderColor: voted ? 'hsl(38 95% 48% / 0.5)' : 'hsl(var(--border))' }}
                >
                  {/* Progress bar */}
                  {(hasVoted || isExpired) && (
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-700"
                      style={{
                        width: `${percent}%`,
                        background: voted ? 'hsl(38 95% 48% / 0.18)' : 'hsl(38 95% 48% / 0.06)',
                      }}
                    />
                  )}
                  <div className="relative flex items-center justify-between px-4 py-3">
                    <span className={`text-sm flex items-center gap-2 ${voted ? 'text-accent font-semibold' : hasVoted ? 'text-muted' : ''}`}>
                      {voted && <span className="text-accent">✓</span>}
                      {option.text}
                    </span>
                    {(hasVoted || isExpired) && (
                      <span className="text-xs text-muted ml-3 flex-shrink-0 tabular-nums">
                        {count > 0 ? `${count} · %${percent}` : '0'}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
        </div>

        {/* Alt bilgi */}
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Users2 className="w-3 h-3" />
            {uniqueVoters} kişi oy verdi
          </span>
          {hasVoted && !isExpired && (
            <span className="text-accent">· Oyun kaydedildi</span>
          )}
          {poll.ends_at && !isExpired && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(poll.ends_at).toLocaleDateString('tr-TR')} bitiyor
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
