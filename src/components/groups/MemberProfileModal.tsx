'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Circle, Crown, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, AVATAR_NAMES } from '@/lib/utils'

const STATUS_OPTIONS: Record<string, { label: string; color: string }> = {
  musait: { label: 'Müsait', color: 'bg-green-400' },
  mesgul: { label: 'Meşgul', color: 'bg-red-400' },
  'rahatsiz-etme': { label: 'Rahatsız etme', color: 'bg-yellow-400' },
  gozukmuyor: { label: 'Görünmüyor', color: 'bg-zinc-500' },
}

interface Props {
  username: string
  avatarId: number
  role: string
  joinedAt: string
  onClose: () => void
}

export default function MemberProfileModal({ username, avatarId, role, joinedAt, onClose }: Props) {
  const [bio, setBio] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('profiles').select('bio, status').eq('username', username).single()
      .then(({ data }) => {
        if (data) { setBio(data.bio); setStatus(data.status) }
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const currentStatus = status ? STATUS_OPTIONS[status] : null

  const roleIcon = role === 'owner'
    ? <Crown className="w-3.5 h-3.5 text-accent" />
    : role === 'admin' ? <Shield className="w-3.5 h-3.5 text-muted" /> : null

  const roleLabel = role === 'owner' ? 'Kurucu' : role === 'admin' ? 'Yönetici' : 'Üye'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-base rounded-2xl w-full max-w-xs overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-end px-4 pt-4">
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Avatar + isim */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-border flex-shrink-0">
              <Image src={getAvatarUrl(avatarId)} alt={username} width={64} height={64} className="w-full h-full" />
            </div>
            <div>
              <p className="font-bold text-base">@{username}</p>
              <p className="text-xs text-muted">{AVATAR_NAMES[avatarId]}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {roleIcon}
                <span className="text-xs text-muted">{roleLabel} · {new Date(joinedAt).toLocaleDateString('tr-TR')} katıldı</span>
              </div>
            </div>
          </div>

          {/* Status */}
          {!loading && currentStatus && (
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${currentStatus.color}`} />
              <span className="text-sm text-muted">{currentStatus.label}</span>
            </div>
          )}
          {!loading && !currentStatus && (
            <div className="flex items-center gap-2">
              <Circle className="w-2.5 h-2.5 text-muted" />
              <span className="text-sm text-muted">Durum belirtilmemiş</span>
            </div>
          )}

          {/* Bio */}
          {!loading && (
            <p className="text-sm text-muted leading-relaxed border-t border-base pt-3">
              {bio || 'Henüz bir şey yazmamış.'}
            </p>
          )}

          {loading && <div className="h-12 bg-surface2 rounded-xl animate-pulse" />}
        </div>
      </div>
    </div>
  )
}
