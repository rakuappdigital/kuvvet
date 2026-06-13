'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (!error) setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">kuvvet</h1>
          <p className="text-muted text-sm">Arkadaşlarınla paylaş, oyla, keşfet</p>
        </div>

        {sent ? (
          <div className="bg-surface rounded-2xl p-8 text-center border border-base">
            <div className="text-4xl mb-4">📬</div>
            <p className="font-medium mb-1">Bağlantı gönderildi!</p>
            <p className="text-muted text-sm">
              <span className="text-accent">{email}</span> adresine giriş bağlantısı gönderildi.
              Spam klasörünü de kontrol et.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-surface rounded-2xl p-8 border border-base space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">E-posta adresi</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sen@ornek.com"
                required
                className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full accent rounded-xl py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Gönderiliyor...' : 'Giriş bağlantısı gönder'}
            </button>
            <p className="text-center text-xs text-muted">
              Şifre yok. Sadece e-posta magic link ile giriş.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
