'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

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
  const [endsAt, setEndsAt] = useState('')
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
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-base rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Yeni Anket</h2>
          <button onClick={onClose} className="text-muted hover:text-accent text-xl">×</button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Soru</label>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Bu hafta nereye gidelim?"
              maxLength={200}
              required
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent transition"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Seçenekler</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Seçenek ${i + 1}`}
                    maxLength={100}
                    className="flex-1 bg-surface2 border border-base rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-accent transition"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-muted hover:text-red-400 px-2 text-lg">×</button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button type="button" onClick={addOption} className="mt-2 text-sm text-accent hover:opacity-80">
                + Seçenek ekle
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="multi"
              checked={allowMultiple}
              onChange={e => setAllowMultiple(e.target.checked)}
              className="accent-purple-500"
            />
            <label htmlFor="multi" className="text-sm">Birden fazla seçim yapılabilsin</label>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Bitiş tarihi <span className="text-xs">(isteğe bağlı)</span></label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={e => setEndsAt(e.target.value)}
              className="w-full bg-surface2 border border-base rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" disabled={loading || !question.trim()} className="flex-1">
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
