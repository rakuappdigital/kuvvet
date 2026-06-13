'use client'

import { useState } from 'react'
import type { Group } from '@/types/database'
import Button from '@/components/ui/Button'

interface Props {
  group: Group
  onClose: () => void
}

export default function InviteModal({ group, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${group.invite_code}`

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Gruba Davet Et</h2>
          <button onClick={onClose} className="text-muted hover:text-accent text-xl leading-none">×</button>
        </div>

        <p className="text-sm text-muted mb-4">
          Bu bağlantıyı paylaşarak arkadaşlarını <span className="text-accent font-medium">{group.name}</span> grubuna davet et.
        </p>

        <div className="bg-surface2 border border-base rounded-xl p-3 flex items-center gap-2 mb-4">
          <span className="text-xs text-muted flex-1 truncate font-mono">{inviteUrl}</span>
          <Button size="sm" onClick={handleCopy}>
            {copied ? '✓ Kopyalandı' : 'Kopyala'}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted">Davet kodu: <span className="font-mono text-accent">{group.invite_code}</span></p>
        </div>

        <Button variant="outline" className="w-full mt-4" onClick={onClose}>Kapat</Button>
      </div>
    </div>
  )
}
