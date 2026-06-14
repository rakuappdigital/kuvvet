'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
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
    <div className="bg-surface border border-base rounded-2xl flex flex-col overflow-hidden" style={{ height: '520px' }}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-base flex items-center justify-between">
        <p className="text-sm font-semibold">Duvar</p>
        <p className="text-xs text-muted">Son 48 saat</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {posts.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted text-sm">Henüz yazı yok. İlk yazan sen ol.</p>
          </div>
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

      {/* Input */}
      <form onSubmit={handlePost} className="px-4 py-3 border-t border-base flex items-end gap-3">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(e) } }}
          placeholder="Bir şeyler yaz..."
          maxLength={500}
          rows={1}
          className="flex-1 bg-surface2 border border-base rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-1 ring-accent transition"
          style={{ maxHeight: '100px' }}
          onInput={e => {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = t.scrollHeight + 'px'
          }}
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="accent w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-90 disabled:opacity-40 transition flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
