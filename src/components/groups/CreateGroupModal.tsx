'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

interface Props {
  userId: string
  onCreated: () => void
  onClose: () => void
}

export default function CreateGroupModal({ userId, onCreated, onClose }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: group, error: groupErr } = await supabase
      .from('groups')
      .insert({ name, description: description || null, created_by: userId })
      .select()
      .single()

    if (groupErr || !group) {
      setError('Grup oluşturulamadı.')
      setLoading(false)
      return
    }

    await supabase.from('group_members').insert({ group_id: group.id, user_id: userId, role: 'owner' })

    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base">
          <h2 className="font-semibold text-sm">Yeni grup</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Grup adı</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Kafadarlar"
              maxLength={40}
              required
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-1 ring-accent transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">
              Açıklama <span className="normal-case text-muted/60">(isteğe bağlı)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Grubu kısaca tanıt..."
              maxLength={200}
              rows={3}
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-1 ring-accent transition resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
