'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import type { Group } from '@/types/database'
import Button from '@/components/ui/Button'

interface Props {
  group: Group
  onClose: () => void
}

export default function InviteModal({ group, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base">
          <h2 className="font-semibold text-sm">Gruba Davet Et</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-muted">
            Bu kodu arkadaşlarınla paylaş. Kod ile <span className="text-accent font-medium">{group.name}</span> grubuna katılabilirler.
          </p>

          {/* Büyük kod gösterimi */}
          <div className="bg-surface2 border border-base rounded-2xl p-6 text-center space-y-4">
            <p className="text-xs text-muted uppercase tracking-widest">Davet Kodu</p>
            <p className="text-4xl font-bold tracking-[0.2em] text-accent font-mono">{group.invite_code}</p>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition ${
                copied
                  ? 'border-accent/40 text-accent bg-accent/10'
                  : 'border-base text-muted hover:text-accent hover:border-accent/40'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Kopyalandı!' : 'Kodu kopyala'}
            </button>
          </div>

          <Button variant="outline" className="w-full" onClick={onClose}>Kapat</Button>
        </div>
      </div>
    </div>
  )
}
