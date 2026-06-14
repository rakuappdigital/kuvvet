'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit2, Check, X, Circle, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, AVATAR_NAMES } from '@/lib/utils'
import type { Profile } from '@/types/database'

const STATUS_OPTIONS = [
  { value: 'musait', label: 'Müsait', color: 'bg-green-400' },
  { value: 'mesgul', label: 'Meşgul', color: 'bg-red-400' },
  { value: 'rahatsiz-etme', label: 'Rahatsız etme', color: 'bg-yellow-400' },
  { value: 'gozukmuyor', label: 'Görünmüyor', color: 'bg-zinc-500' },
]

interface Props {
  profile: Profile
  isOwn: boolean
}

export default function ProfileClient({ profile, isOwn }: Props) {
  const [bio, setBio] = useState(profile.bio || '')
  const [status, setStatus] = useState(profile.status || '')
  const [avatarId, setAvatarId] = useState(profile.avatar_id)
  const [editingBio, setEditingBio] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [bioInput, setBioInput] = useState(profile.bio || '')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function saveBio() {
    setSaving(true)
    await supabase.from('profiles').update({ bio: bioInput.trim() || null }).eq('id', profile.id)
    setBio(bioInput.trim())
    setEditingBio(false)
    setSaving(false)
  }

  async function saveStatus(val: string) {
    const newStatus = val === status ? null : val
    setStatus(newStatus || '')
    await supabase.from('profiles').update({ status: newStatus }).eq('id', profile.id)
  }

  async function saveAvatar(id: number) {
    setAvatarId(id)
    setShowAvatarPicker(false)
    await supabase.from('profiles').update({ avatar_id: id }).eq('id', profile.id)
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status)

  return (
    <div className="space-y-6">
      {/* Profil kartı */}
      <div className="bg-surface border border-base rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-border">
            <Image
              src={getAvatarUrl(avatarId)}
              alt={profile.username}
              width={96}
              height={96}
              className="w-full h-full"
            />
          </div>
          {currentStatus && (
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${currentStatus.color} ring-2 ring-surface`} />
          )}
          {isOwn && (
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 hover:opacity-100 transition"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        {/* Bilgiler */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">@{profile.username}</h1>
            <p className="text-xs text-muted mt-0.5">{AVATAR_NAMES[avatarId]}</p>
            {currentStatus && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted mt-1">
                <Circle className={`w-2 h-2 fill-current ${currentStatus.color.replace('bg-', 'text-')}`} />
                {currentStatus.label}
              </span>
            )}
          </div>

          {/* Bio */}
          <div>
            {editingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioInput}
                  onChange={e => setBioInput(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="Kendinden bahset..."
                  autoFocus
                  className="w-full bg-surface2 border border-base rounded-xl px-3 py-2 text-sm resize-none focus:ring-1 ring-accent transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveBio}
                    disabled={saving}
                    className="accent flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Kaydet
                  </button>
                  <button
                    onClick={() => { setEditingBio(false); setBioInput(bio) }}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-accent px-3 py-1.5 rounded-lg border border-base hover:bg-surface2 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 group/bio">
                <p className="text-sm text-muted leading-relaxed flex-1">
                  {bio || (isOwn ? 'Henüz bir şey yazmadın...' : 'Henüz bir şey yazmamış.')}
                </p>
                {isOwn && (
                  <button
                    onClick={() => { setBioInput(bio); setEditingBio(true) }}
                    className="opacity-0 group-hover/bio:opacity-100 text-muted hover:text-accent transition p-1 flex-shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Müsaitlik durumu — sadece kendi profili */}
      {isOwn && (
        <div className="bg-surface border border-base rounded-2xl p-5 space-y-3">
          <p className="text-xs font-medium text-muted uppercase tracking-widest">Müsaitlik Durumu</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => saveStatus(opt.value)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition ${
                  status === opt.value
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-base hover:bg-surface2 hover:border-accent/30 text-muted hover:text-accent'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${opt.color}`} />
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">Seçiliyken tekrar tıklarsan kaldırırsın.</p>
        </div>
      )}

      {/* Başkasının profili — müsaitlik göster */}
      {!isOwn && currentStatus && (
        <div className="bg-surface border border-base rounded-2xl p-5 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${currentStatus.color}`} />
          <div>
            <p className="text-sm font-medium">{currentStatus.label}</p>
            <p className="text-xs text-muted">@{profile.username} şu an {currentStatus.label.toLowerCase()}</p>
          </div>
        </div>
      )}

      {/* Avatar seçici modal */}
      {showAvatarPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="bg-surface border border-base rounded-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-base">
              <h2 className="font-semibold text-sm">Avatar Seç</h2>
              <button onClick={() => setShowAvatarPicker(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto">
              {Array.from({ length: 20 }, (_, i) => i + 1).map(id => (
                <button
                  key={id}
                  onClick={() => saveAvatar(id)}
                  title={AVATAR_NAMES[id]}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition hover:scale-105 ${
                    avatarId === id ? 'border-accent' : 'border-transparent hover:border-accent/40'
                  }`}
                >
                  <Image src={getAvatarUrl(id)} alt={AVATAR_NAMES[id]} fill className="object-cover" />
                  {avatarId === id && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-accent" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4 text-center">
              <p className="text-xs text-muted">Seçince otomatik kaydedilir.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
