'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/ui/Avatar'
import { useTheme } from '@/components/ThemeProvider'
import type { Profile } from '@/types/database'

interface Props { profile: Profile }

export default function Navbar({ profile }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggle } = useTheme()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-base">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <Image src="/logo.svg" alt="nabiyonlan" width={28} height={28} />
          </div>
          <span className="font-bold text-base tracking-tight">nabiyonlan</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition"
            title={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href={`/profile/${profile.username}`} className="flex items-center gap-2 hover:opacity-80 transition px-1">
            <span className="text-sm text-muted hidden sm:block">@{profile.username}</span>
            <Avatar avatarId={profile.avatar_id} username={profile.username} size={30} className="ring-1 ring-border" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition"
            title="Çıkış yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  )
}
