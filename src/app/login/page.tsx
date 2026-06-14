'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Image from 'next/image'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, hsl(38 95% 48% / 0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm space-y-10">
        {/* Logo + brand */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden glow-accent ring-1 ring-accent/30">
            <Image src="/logo.svg" alt="nabiyonlan" width={56} height={56} className="w-full h-full" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">nabiyonlan</h1>
            <p className="text-muted text-sm mt-1">Arkadaşlarınla paylaş, oyla, keşfet.</p>
          </div>
        </div>

        {/* Card */}
        {sent ? (
          <div className="bg-surface rounded-2xl p-8 border border-base text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center mx-auto border border-base">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <p className="font-semibold">Bağlantı gönderildi</p>
            <p className="text-muted text-sm leading-relaxed">
              <span className="text-accent">{email}</span> adresine giriş bağlantısı gönderildi. Spam klasörünü de kontrol et.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-surface rounded-2xl p-6 border border-base space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted uppercase tracking-widest">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sen@ornek.com"
                required
                className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-1 ring-accent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="accent w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition glow-accent"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Giriş bağlantısı gönder
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted">
              Şifre yok · Sadece magic link ile giriş
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
