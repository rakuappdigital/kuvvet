'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import WallPost from './WallPost'
import type { Profile } from '@/types/database'

interface PostWithProfile {
  id: string
  content: string
  created_at: string
  profiles: { username: string; avatar_id: number }
}

interface Props {
  groupId: string
  currentProfile: Profile
}

export default function Wall({ groupId, currentProfile }: Props) {
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()

    const channel = supabase
      .channel(`wall:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'wall_posts',
        filter: `group_id=eq.${groupId}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('wall_posts')
          .select('id, content, created_at, profiles(username, avatar_id)')
          .eq('id', payload.new.id)
          .single()
        if (data) setPosts(prev => [...prev, data as unknown as PostWithProfile])
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'wall_posts',
        filter: `group_id=eq.${groupId}`,
      }, (payload) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [posts])

  async function fetchPosts() {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('wall_posts')
      .select('id, content, created_at, profiles(username, avatar_id)')
      .eq('group_id', groupId)
      .gte('created_at', twoDaysAgo)
      .order('created_at', { ascending: true })
    if (data) setPosts(data as unknown as PostWithProfile[])
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    await supabase.from('wall_posts').insert({
      group_id: groupId,
      user_id: currentProfile.id,
      content: content.trim(),
    })
    setContent('')
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('wall_posts').delete().eq('id', id)
  }

  return (
    <div className="bg-surface border border-base rounded-2xl flex flex-col" style={{ height: '500px' }}>
      <div className="p-4 border-b border-base">
        <h3 className="font-semibold text-sm">Duvar <span className="text-muted font-normal">(son 48 saat)</span></h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {posts.length === 0 && (
          <p className="text-center text-muted text-sm py-8">Henüz yazı yok. İlk yazan sen ol!</p>
        )}
        {posts.map(post => (
          <WallPost
            key={post.id}
            post={post}
            isOwn={post.profiles.username === currentProfile.username}
            onDelete={handleDelete}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handlePost} className="p-4 border-t border-base flex gap-3">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(e) } }}
          placeholder="Bir şeyler yaz... (Enter ile gönder)"
          maxLength={500}
          rows={1}
          className="flex-1 bg-surface2 border border-base rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 ring-accent transition"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="accent rounded-xl px-4 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition"
        >
          Gönder
        </button>
      </form>
    </div>
  )
}
