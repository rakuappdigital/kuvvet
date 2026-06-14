'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AtSign, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl } from '@/lib/utils'
import Image from 'next/image'

const AVATARS = Array.from({ length: 20 }, (_, i) => i + 1)

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAvatar) { setError('Bir avatar seçmelisin.'); return }
    if (username.length < 3) { setError('En az 3 karakter olmalı.'); return }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Sadece küçük harf, rakam ve alt çizgi kullanabilirsin.')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      username,
      avatar_id: selectedAvatar,
    })

    if (insertError) {
      setError(insertError.code === '23505'
        ? 'Bu kullanıcı adı alınmış, başka bir tane dene.'
        : 'Bir hata oluştu, tekrar dene.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, hsl(38 95% 48% / 0.06) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-lg space-y-8">
        <div className="text-center">
          <p className="text-muted text-xs uppercase tracking-widest font-medium mb-2">nabiyonlan</p>
          <h1 className="text-2xl font-bold tracking-tight">Profilini oluştur</h1>
          <p className="text-muted text-sm mt-1">Bir kez ayarla — kullanıcı adın kalıcı, değişmez.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-base divide-y divide-base overflow-hidden">
          {/* Username section */}
          <div className="p-6 space-y-3">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Kullanıcı adı</label>
            <div className="flex items-center bg-surface2 border border-base rounded-xl px-4 py-3 gap-2 focus-within:ring-1 ring-accent transition">
              <AtSign className="w-4 h-4 text-muted flex-shrink-0" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="kullanici_adi"
                maxLength={20}
                required
                className="bg-transparent flex-1 text-sm"
              />
              {username.length >= 3 && (
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted">Küçük harf, rakam ve alt çizgi · maks. 20 karakter</p>
          </div>

          {/* Avatar section */}
          <div className="p-6 space-y-4">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Avatar</label>
            <div className="grid grid-cols-5 gap-2.5">
              {AVATARS.map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedAvatar(id)}
                  className={`relative rounded-xl p-1 transition-all duration-150 ${
                    selectedAvatar === id
                      ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface bg-surface2'
                      : 'hover:bg-surface2 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={getAvatarUrl(id)} alt={`Avatar ${id}`} width={52} height={52} className="w-full rounded-lg" />
                  {selectedAvatar === id && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 accent rounded-full flex items-center justify-center text-[9px] font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="p-6 space-y-3">
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !selectedAvatar || username.length < 3}
              className="accent w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition glow-accent"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Başla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
