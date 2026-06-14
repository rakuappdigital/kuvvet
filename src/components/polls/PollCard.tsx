'use client'

import { useState, useEffect } from 'react'
import { Check, Clock, Users2, ToggleLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Poll, PollOption, PollVote, Profile } from '@/types/database'

interface Props {
  poll: Poll & { poll_options: PollOption[] }
  currentProfile: Profile
}

export default function PollCard({ poll, currentProfile }: Props) {
  const [votes, setVotes] = useState<PollVote[]>([])
  const [voting, setVoting] = useState(false)
  const supabase = createClient()
  const isExpired = poll.ends_at ? new Date(poll.ends_at) < new Date() : false
  const myVotes = votes.filter(v => v.user_id === currentProfile.id).map(v => v.option_id)
  const totalVotes = votes.length
  const uniqueVoters = new Set(votes.map(v => v.user_id)).size

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
    if (voting || isExpired) return
    setVoting(true)
    const alreadyVoted = myVotes.includes(optionId)
    if (alreadyVoted) {
      await supabase.from('poll_votes').delete()
        .eq('poll_id', poll.id).eq('option_id', optionId).eq('user_id', currentProfile.id)
    } else {
      if (!poll.allow_multiple && myVotes.length > 0) {
        await supabase.from('poll_votes').delete()
          .eq('poll_id', poll.id).eq('user_id', currentProfile.id)
      }
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

  return (
    <div className="bg-surface border border-base rounded-2xl p-5 space-y-4">
      {/* Question */}
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

      {/* Options */}
      <div className="space-y-2">
        {poll.poll_options
          .sort((a, b) => a.position - b.position)
          .map(option => {
            const voted = myVotes.includes(option.id)
            const percent = getPercent(option.id)
            const count = getVoteCount(option.id)

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={isExpired || voting}
                className="w-full text-left relative overflow-hidden rounded-xl border transition-all duration-150 disabled:cursor-default"
                style={{
                  borderColor: voted ? 'hsl(38 95% 48% / 0.5)' : 'hsl(var(--border))',
                }}
              >
                {/* Progress bar */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{
                    width: `${percent}%`,
                    background: voted
                      ? 'hsl(38 95% 48% / 0.18)'
                      : 'hsl(38 95% 48% / 0.06)',
                  }}
                />
                <div className="relative flex items-center justify-between px-4 py-3">
                  <span className={`text-sm ${voted ? 'text-accent font-semibold' : 'text-text/80'} flex items-center gap-2`}>
                    {voted && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    {option.text}
                  </span>
                  <span className="text-xs text-muted ml-3 flex-shrink-0 tabular-nums">
                    {count > 0 ? `${count} · ${percent}%` : ''}
                  </span>
                </div>
              </button>
            )
          })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-muted pt-1">
        <span className="inline-flex items-center gap-1">
          <Users2 className="w-3 h-3" />
          {uniqueVoters} kişi oy verdi
        </span>
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
  )
}
