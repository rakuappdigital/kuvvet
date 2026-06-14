'use client'

import { useState } from 'react'
import { X, Plus, Loader2, Trash2, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import type { PollPriority } from '@/types/database'

const PRIORITIES: { value: PollPriority; label: string; dot: string }[] = [
  { value: 'normal', label: 'Normal', dot: 'bg-green-400' },
  { value: 'acil',   label: 'Acil',   dot: 'bg-yellow-400' },
  { value: 'kritik', label: 'Kritik', dot: 'bg-red-400' },
]

interface Props {
  groupId: string
  userId: string
  onCreated: () => void
  onClose: () => void
}

export default function CreatePollModal({ groupId, userId, onCreated, onClose }: Props) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [hasEndsAt, setHasEndsAt] = useState(false)
  const [endsAt, setEndsAt] = useState('')
  const [priority, setPriority] = useState<PollPriority>('normal')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  function addOption() {
    if (options.length < 6) setOptions(prev => [...prev, ''])
  }
  function updateOption(i: number, val: string) {
    setOptions(prev => { const n = [...prev]; n[i] = val; return n })
  }
  function removeOption(i: number) {
    if (options.length <= 2) return
    setOptions(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const validOptions = options.filter(o => o.trim())
    if (validOptions.length < 2) return
    setLoading(true)

    const { data: poll, error } = await supabase
      .from('polls')
      .insert({
        group_id: groupId,
        created_by: userId,
        question: question.trim(),
        allow_multiple: allowMultiple,
        priority,
        ends_at: hasEndsAt && endsAt ? new Date(endsAt).toISOString() : null,
      })
      .select()
      .single()

    if (error || !poll) { setLoading(false); return }

    await supabase.from('poll_options').insert(
      validOptions.map((text, i) => ({ poll_id: poll.id, text: text.trim(), position: i }))
    )

    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base sticky top-0 bg-surface z-10">
          <h2 className="font-semibold text-sm">Yeni Anket</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-muted hover:text-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-5">
          {/* Öncelik */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Öncelik</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition ${
                    priority === p.value
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-base text-muted hover:bg-surface2 hover:text-accent hover:border-accent/30'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Soru */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Soru</label>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Bu hafta nereye gidelim?"
              maxLength={200}
              required
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-1 ring-accent transition"
            />
          </div>

          {/* Seçenekler */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted uppercase tracking-widest">Seçenekler</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  placeholder={`Seçenek ${i + 1}`}
                  maxLength={100}
                  className="flex-1 bg-surface2 border border-base rounded-xl px-4 py-2.5 text-sm focus:ring-1 ring-accent transition"
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(i)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-base hover:bg-surface2 text-muted hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button type="button" onClick={addOption}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition mt-1">
                <Plus className="w-3.5 h-3.5" />
                Seçenek ekle
              </button>
            )}
          </div>

          {/* Ayarlar */}
          <div className="bg-surface2 rounded-xl border border-base p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setAllowMultiple(v => !v)}
                className={`w-9 h-5 rounded-full transition-all relative ${allowMultiple ? 'bg-accent' : 'bg-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${allowMultiple ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-sm">Birden fazla seçim</span>
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setHasEndsAt(v => !v); setEndsAt('') }}
                className={`flex items-center gap-2 text-sm transition ${hasEndsAt ? 'text-accent' : 'text-muted hover:text-accent'}`}
              >
                <Calendar className="w-4 h-4" />
                {hasEndsAt ? 'Bitiş tarihi kaldır' : 'Bitiş tarihi ekle (isteğe bağlı)'}
              </button>
              {hasEndsAt && (
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={e => setEndsAt(e.target.value)}
                  required={hasEndsAt}
                  className="w-full bg-surface border border-base rounded-xl px-3 py-2 text-sm focus:ring-1 ring-accent transition"
                  style={{ colorScheme: 'dark' }}
                />
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" disabled={loading || !question.trim()} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
