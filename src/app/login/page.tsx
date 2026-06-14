'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Image from 'next/image'
import { AtSign, Lock, ArrowRight, Loader2, Eye, EyeOff, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register' | 'reset'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/reset`,
      })
      if (error) setError('Bir hata oluştu, tekrar dene.')
      else setResetSent(true)
      setLoading(false)
      return
    }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('E-posta veya şifre hatalı.')
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Bu e-posta zaten kayıtlı. Giriş yap.')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }
      await supabase.auth.signInWithPassword({ email, password })
      router.push('/onboarding')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, hsl(38 95% 48% / 0.07) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden glow-accent ring-1 ring-accent/30">
            <Image src="/logo.svg" alt="nabiyonlan" width={56} height={56} className="w-full h-full" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">nabiyonlan</h1>
            <p className="text-muted text-sm mt-1">Arkadaşlarınla paylaş, oyla, keşfet.</p>
          </div>
        </div>

        {/* Reset sent state */}
        {mode === 'reset' && resetSent ? (
          <div className="bg-surface rounded-2xl border border-base p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface2 border border-base flex items-center justify-center mx-auto">
              <MailCheck className="w-5 h-5 text-accent" />
            </div>
            <p className="font-semibold">Şifre sıfırlama gönderildi</p>
            <p className="text-muted text-sm leading-relaxed">
              <span className="text-accent">{email}</span> adresine şifre sıfırlama bağlantısı gönderildi.
            </p>
            <button
              onClick={() => { setMode('login'); setResetSent(false) }}
              className="text-sm text-accent hover:opacity-80 transition"
            >
              Giriş yap
            </button>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-base overflow-hidden">
            {/* Tabs */}
            {mode !== 'reset' && (
              <div className="flex p-1.5 gap-1 bg-surface2">
                {(['login', 'register'] as Mode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError('') }}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                      mode === m ? 'accent' : 'text-muted hover:text-accent'
                    }`}
                  >
                    {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                  </button>
                ))}
              </div>
            )}

            {mode === 'reset' && (
              <div className="px-6 pt-6">
                <h2 className="font-semibold text-sm">Şifremi Unuttum</h2>
                <p className="text-muted text-xs mt-1">E-postana sıfırlama bağlantısı gönderilecek.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted uppercase tracking-widest">E-posta</label>
                <div className="flex items-center bg-surface2 border border-base rounded-xl px-4 py-3 gap-2 focus-within:ring-1 ring-accent transition">
                  <AtSign className="w-4 h-4 text-muted flex-shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="sen@ornek.com"
                    required
                    className="bg-transparent flex-1 text-sm"
                  />
                </div>
              </div>

              {/* Password — sadece login ve register'da */}
              {mode !== 'reset' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-muted uppercase tracking-widest">Şifre</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setError('') }}
                        className="text-xs text-muted hover:text-accent transition"
                      >
                        Şifremi unuttum
                      </button>
                    )}
                  </div>
                  <div className="flex items-center bg-surface2 border border-base rounded-xl px-4 py-3 gap-2 focus-within:ring-1 ring-accent transition">
                    <Lock className="w-4 h-4 text-muted flex-shrink-0" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="bg-transparent flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="text-muted hover:text-accent transition flex-shrink-0"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'register' && (
                    <p className="text-xs text-muted">En az 6 karakter</p>
                  )}
                </div>
              )}

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="accent w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition glow-accent"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Sıfırlama Gönder'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError('') }}
                  className="w-full text-sm text-muted hover:text-accent transition text-center"
                >
                  Geri dön
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
