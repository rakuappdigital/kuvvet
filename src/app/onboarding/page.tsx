'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    if (!selectedAvatar) {
      setError('Bir avatar seçmelisin.')
      return
    }
    if (username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalı.')
      return
    }
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
      if (insertError.code === '23505') {
        setError('Bu kullanıcı adı alınmış. Başka bir tane dene.')
      } else {
        setError('Bir hata oluştu. Tekrar dene.')
      }
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Hoş geldin 👋</h1>
          <p className="text-muted text-sm">Bir kez ayarla, bir daha değişmez.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-8 border border-base space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Kullanıcı adı
              <span className="text-muted font-normal ml-2 text-xs">(kalıcı, değiştirilemez)</span>
            </label>
            <div className="flex items-center bg-surface2 border border-base rounded-xl px-4 py-3">
              <span className="text-muted text-sm mr-1">@</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="kullanici_adi"
                maxLength={20}
                required
                className="bg-transparent flex-1 text-sm"
              />
            </div>
          </div>

          {/* Avatar grid */}
          <div>
            <label className="block text-sm font-medium mb-3">Avatar seç</label>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedAvatar(id)}
                  className={`relative rounded-2xl p-1 transition-all ${
                    selectedAvatar === id
                      ? 'ring-2 ring-offset-2 ring-offset-surface bg-surface2'
                      : 'hover:bg-surface2'
                  }`}
                  style={{ ['--tw-ring-color' as string]: 'hsl(258 80% 65%)' }}
                >
                  <Image
                    src={getAvatarUrl(id)}
                    alt={`Avatar ${id}`}
                    width={56}
                    height={56}
                    className="w-full rounded-xl"
                  />
                  {selectedAvatar === id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 accent rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !selectedAvatar || username.length < 3}
            className="w-full accent rounded-xl py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition"
          >
            {loading ? 'Kaydediliyor...' : 'Başla'}
          </button>
        </form>
      </div>
    </div>
  )
}
