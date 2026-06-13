'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchVotes()
    const channel = supabase
      .channel(`poll:${poll.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'poll_votes',
        filter: `poll_id=eq.${poll.id}`,
      }, () => fetchVotes())
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
        // Remove existing vote first
        await supabase.from('poll_votes').delete()
          .eq('poll_id', poll.id).eq('user_id', currentProfile.id)
      }
      await supabase.from('poll_votes').insert({
        poll_id: poll.id,
        option_id: optionId,
        user_id: currentProfile.id,
      })
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
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-snug">{poll.question}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isExpired && <span className="text-xs text-muted bg-surface2 px-2 py-0.5 rounded-full">Sona erdi</span>}
          {poll.allow_multiple && <span className="text-xs text-muted bg-surface2 px-2 py-0.5 rounded-full">Çoklu seçim</span>}
        </div>
      </div>

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
                className="w-full text-left relative overflow-hidden rounded-xl border border-base transition hover:border-accent disabled:cursor-default group"
              >
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    background: voted ? 'hsl(258 80% 65% / 0.25)' : 'hsl(258 80% 65% / 0.08)'
                  }}
                />
                <div className="relative flex items-center justify-between px-4 py-3">
                  <span className={`text-sm ${voted ? 'text-accent font-medium' : ''}`}>
                    {voted && <span className="mr-1.5">✓</span>}
                    {option.text}
                  </span>
                  <span className="text-xs text-muted ml-2">{count} {percent > 0 ? `(${percent}%)` : ''}</span>
                </div>
              </button>
            )
          })}
      </div>

      <p className="text-xs text-muted">
        {totalVotes} oy
        {poll.ends_at && !isExpired && ` · ${new Date(poll.ends_at).toLocaleDateString('tr-TR')} tarihinde sona erer`}
      </p>
    </div>
  )
}
