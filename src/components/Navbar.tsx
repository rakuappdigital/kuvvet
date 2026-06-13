'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/ui/Avatar'
import type { Profile } from '@/types/database'

interface Props {
  profile: Profile
}

export default function Navbar({ profile }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-base">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-accent">kuvvet</Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:block">@{profile.username}</span>
          <Avatar avatarId={profile.avatar_id} username={profile.username} size={32} />
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-accent transition px-2 py-1"
          >
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  )
}
