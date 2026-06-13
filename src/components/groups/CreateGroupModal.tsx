'use client'

import { useState } from 'react'
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

    // Add creator as owner
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'owner',
    })

    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Yeni Grup</h2>
          <button onClick={onClose} className="text-muted hover:text-accent text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Grup adı</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Kafadarlar"
              maxLength={40}
              required
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent transition"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Açıklama <span className="text-xs">(isteğe bağlı)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Grubu kısaca tanıt..."
              maxLength={200}
              rows={3}
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent transition resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
