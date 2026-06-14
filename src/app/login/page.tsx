'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Image from 'next/image'
import { AtSign, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

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
      // Auto sign in after register
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

        {/* Card */}
        <div className="bg-surface rounded-2xl border border-base overflow-hidden">
          {/* Tabs */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted uppercase tracking-widest">Şifre</label>
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

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="accent w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition glow-accent"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
