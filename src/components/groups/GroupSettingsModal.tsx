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
    await supabase.from('groups').delete().eq('id', group.id)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base sticky top-0 bg-surface z-10">
          <h2 className="font-semibold text-sm">Grup Ayarları</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Avatar seç */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Grup Avatarı</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  className={`relative rounded-xl p-1 transition-all ${
                    avatarId === id
                      ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface'
                      : 'hover:bg-surface2 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={getGroupAvatarUrl(id)} alt={`Avatar ${id}`} width={48} height={48} className="w-full rounded-lg" />
                  {avatarId === id && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 accent rounded-full flex items-center justify-center text-[9px] font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* İsim */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Grup adı</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              required
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-1 ring-accent transition"
            />
          </div>

          {/* Açıklama */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">
              Açıklama <span className="normal-case text-muted/60">(isteğe bağlı)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-1 ring-accent transition resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kaydet'}
            </Button>
          </div>
        </form>

        {/* Danger zone */}
        <div className="px-6 pb-6">
          <div className="border border-red-500/20 rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-red-400 uppercase tracking-widest">Tehlikeli Alan</p>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition"
              >
                <Trash2 className="w-4 h-4" />
                Grubu sil
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Grup ve tüm içeriği kalıcı olarak silinecek. Emin misin?</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="flex-1 text-sm text-muted hover:text-accent transition py-2"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl py-2 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Evet, sil'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
