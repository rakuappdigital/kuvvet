'use client'

import { useState } from 'react'
import { X, Loader2, Hash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

interface Props {
  userId: string
  onClose: () => void
}

export default function JoinGroupModal({ userId, onClose }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const trimmed = code.trim().toLowerCase()

    const { data: rows } = await supabase.rpc('find_group_by_invite_code', { code: trimmed })
    const group = rows?.[0] ?? null

    if (!group) {
      setError('Geçersiz kod. Tekrar kontrol et.')
      setLoading(false)
      return
    }

    // Zaten üye mi?
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!existing) {
      await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: userId,
        role: 'member',
      })
    }

    router.push(`/groups/${group.id}`)
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base">
          <h2 className="font-semibold text-sm">Gruba Katıl</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-6 space-y-4">
          <p className="text-sm text-muted">Arkadaşından aldığın davet kodunu gir.</p>

          <div className="flex items-center bg-surface2 border border-base rounded-xl px-4 py-3 gap-2 focus-within:ring-1 ring-accent transition">
            <Hash className="w-4 h-4 text-muted flex-shrink-0" />
            <input
              value={code}
              onChange={e => setCode(e.target.value.toLowerCase().replace(/\s/g, ''))}
              placeholder="davet kodu"
              maxLength={12}
              required
              className="bg-transparent flex-1 text-sm font-mono tracking-wider"
              autoFocus
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" disabled={loading || !code.trim()} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Katıl'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
