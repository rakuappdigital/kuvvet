'use client'

import { useState } from 'react'
import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getGroupAvatarUrl } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { Group } from '@/types/database'

const AVATARS = Array.from({ length: 20 }, (_, i) => i + 1)

interface Props {
  group: Group
  onClose: () => void
  onUpdated: (updated: Partial<Group>) => void
}

export default function GroupSettingsModal({ group, onClose, onUpdated }: Props) {
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description || '')
  const [avatarId, setAvatarId] = useState(group.avatar_id || 1)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('groups')
      .update({ name: name.trim(), description: description.trim() || null, avatar_id: avatarId })
      .eq('id', group.id)

    if (error) {
      setError('Kaydedilemedi.')
      setLoading(false)
      return
    }

    onUpdated({ name: name.trim(), description: description.trim() || null, avatar_id: avatarId })
    onClose()
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('groups').delete().eq('id', group.id)
    if (error) {
      setError('Grup silinemedi: ' + error.message)
      setDeleting(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-base">
          <h2 className="font-semibold text-sm">Grup Ayarları</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Avatar seç */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Grup Avatarı</label>
            <div className="grid grid-cols-10 gap-1.5">
              {AVATARS.map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  className={`relative rounded-lg p-0.5 transition-all ${
                    avatarId === id
                      ? 'ring-2 ring-accent ring-offset-1 ring-offset-surface'
                      : 'hover:bg-surface2 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={getGroupAvatarUrl(id)} alt={`Avatar ${id}`} width={32} height={32} className="w-full rounded-md" />
                </button>
              ))}
            </div>
          </div>

          {/* İsim + Açıklama yan yana */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted uppercase tracking-widest">Grup adı</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={40}
                required
                className="w-full bg-surface2 border border-base rounded-xl px-3 py-2 text-sm focus:ring-1 ring-accent transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted uppercase tracking-widest">Açıklama</label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={200}
                placeholder="isteğe bağlı"
                className="w-full bg-surface2 border border-base rounded-xl px-3 py-2 text-sm focus:ring-1 ring-accent transition"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          {/* Alt satır: sil + kaydet */}
          <div className="flex items-center gap-2 pt-1">
            {!deleteConfirm ? (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition mr-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Grubu sil
              </button>
            ) : (
              <div className="flex items-center gap-2 mr-auto">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">Emin misin?</span>
                <button type="button" onClick={() => setDeleteConfirm(false)} className="text-xs text-muted hover:text-accent transition">Vazgeç</button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition disabled:opacity-50 flex items-center gap-1"
                >
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Evet, sil'}
                </button>
              </div>
            )}
            <Button variant="outline" type="button" onClick={onClose} className="px-4">İptal</Button>
            <Button type="submit" disabled={loading || !name.trim()} className="px-4">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
