// FILE: app/all/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

// Import addLog if you actually have app/actions/log.ts.
// If not, we define a no-op fallback.
let addLog: ((entry: {
  action: string
  entity_type: string
  entity_id: string
  details?: Record<string, unknown>
}) => Promise<void>) | undefined

try {
  // Dynamic import so build won’t fail if log.ts doesn’t exist
  addLog = require('@/app/actions/log').addLog
} catch {
  addLog = async () => {}
}

// Update a row's editable fields (name, unit, on_hand, max_capacity, alert_level)
export async function updateItemAll(id: string, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const unit = String(formData.get('unit') ?? '').trim() || 'each'
  const on_hand = Number(formData.get('on_hand') ?? 0)
  const max_capacity_raw = formData.get('max_capacity')
  const alert_level_raw = formData.get('alert_level')

  const max_capacity = max_capacity_raw === '' ? null : Number(max_capacity_raw ?? 0)
  const alert_level = alert_level_raw === '' ? null : Number(alert_level_raw ?? 0)

  await supabase.from('items').update({
    name,
    unit,
    on_hand: Math.max(0, on_hand),
    max_capacity,
    alert_level,
  }).eq('id', id)

  await addLog?.({
    action: 'item.update',
    entity_type: 'item',
    entity_id: id,
    details: { name, unit, on_hand, max_capacity, alert_level },
  })

  revalidatePath('/all')
  revalidatePath('/all/replenish')
}

// Adjust stock by a delta (positive or negative). Never go below 0.
export async function adjustItemAll(id: string, delta: number) {
  const { data, error } = await supabase
    .from('items')
    .select('on_hand')
    .eq('id', id)
    .single()

  if (error) return

  const current = Number(data?.on_hand ?? 0)
  const next = Math.max(0, current + Number(delta))

  await supabase.from('items').update({ on_hand: next }).eq('id', id)

  await addLog?.({
    action: 'item.adjust',
    entity_type: 'item',
    entity_id: id,
    details: { delta, from: current, to: next },
  })

  revalidatePath('/all')
  revalidatePath('/all/replenish')
}

// Delete item
export async function deleteItemAll(id: string) {
  await supabase.from('items').delete().eq('id', id)

  await addLog?.({
    action: 'item.delete',
    entity_type: 'item',
    entity_id: id,
  })

  revalidatePath('/all')
  revalidatePath('/all/replenish')
}
