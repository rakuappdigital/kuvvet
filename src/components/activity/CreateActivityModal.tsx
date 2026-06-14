'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

interface Props {
  groupId: string
  userId: string
  onCreated: () => void
  onClose: () => void
}

export default function CreateActivityModal({ groupId, userId, onCreated, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)

    await supabase.from('activities').insert({
      group_id: groupId,
      created_by: userId,
      title: title.trim(),
    })

    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base">
          <h2 className="font-semibold text-sm">Yeni Aktivite</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <p className="text-sm text-muted">Grup üyeleri 24 saat boyunca katılıp katılmayacaklarını belirtebilir.</p>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Aktivite</label>
            <textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Cuma akşamı buluşma — Kadıköy"
              maxLength={300}
              rows={3}
              required
              autoFocus
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-1 ring-accent transition resize-none"
            />
            <p className="text-xs text-muted text-right">{title.length}/300</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" disabled={loading || !title.trim()} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
