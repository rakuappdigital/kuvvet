'use client'

import { useState } from 'react'
import { X, Copy, Check, Link2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base">
          <h2 className="font-semibold text-sm">Gruba davet et</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-muted leading-relaxed">
            Bu bağlantıyı paylaşarak arkadaşlarını{' '}
            <span className="text-accent font-medium">{group.name}</span>{' '}
            grubuna davet et.
          </p>

          {/* Link box */}
          <div className="bg-surface2 border border-base rounded-xl p-3 flex items-center gap-3">
            <Link2 className="w-4 h-4 text-muted flex-shrink-0" />
            <span className="text-xs text-muted flex-1 truncate font-mono">{inviteUrl}</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                copied ? 'text-accent' : 'text-muted hover:text-accent hover:bg-surface'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">davet kodu</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="text-center">
            <span className="font-mono text-lg font-bold text-accent tracking-widest">{group.invite_code}</span>
          </div>

          <Button variant="outline" className="w-full" onClick={onClose}>Kapat</Button>
        </div>
      </div>
    </div>
  )
}
