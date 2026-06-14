'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase sets session from URL hash automatically
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Şifre güncellenemedi. Bağlantı süresi dolmuş olabilir.')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
          <p className="font-semibold">Şifre güncellendi!</p>
          <p className="text-muted text-sm">Yönlendiriliyorsun...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl border border-base p-6 space-y-4">
          <div>
            <h1 className="font-bold text-lg">Yeni şifre belirle</h1>
            <p className="text-muted text-sm mt-1">En az 6 karakter.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-surface2 border border-base rounded-xl px-4 py-3 gap-2 focus-within:ring-1 ring-accent transition">
              <Lock className="w-4 h-4 text-muted flex-shrink-0" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Yeni şifre"
                required
                minLength={6}
                className="bg-transparent flex-1 text-sm"
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-muted hover:text-accent transition">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="accent w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition glow-accent"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Şifreyi Güncelle'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
