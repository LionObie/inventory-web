// FILE: app/all/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
// If you added logging earlier, keep this import; otherwise you can delete it.
import { addLog } from '@/app/actions/log'

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

  // optional log
  try {
    await addLog?.({
      action: 'item.update',
      entity_type: 'item',
      entity_id: id,
      details: { name, unit, on_hand, max_capacity, alert_level },
    })
  } catch {}

  // refresh both All Items and its replenish view
  revalidatePath('/all')
  revalidatePath('/all/replenish')
}

// Adjust stock by a delta (positive or negative). Never go below 0.
export async function adjustItemAll(id: string, delta: number) {
  // get current on_hand
  const { data, error } = await supabase
    .from('items')
    .select('on_hand')
    .eq('id', id)
    .single()

  if (error) return

  const current = Number(data?.on_hand ?? 0)
  const next = Math.max(0, current + Number(delta))

  await supabase.from('items').update({ on_hand: next }).eq('id', id)

  // optional log
  try {
    await addLog?.({
      action: 'item.adjust',
      entity_type: 'item',
      entity_id: id,
      details: { delta, from: current, to: next },
    })
  } catch {}

  revalidatePath('/all')
  revalidatePath('/all/replenish')
}

// Delete item
export async function deleteItemAll(id: string) {
  await supabase.from('items').delete().eq('id', id)

  // optional log
  try {
    await addLog?.({
      action: 'item.delete',
      entity_type: 'item',
      entity_id: id,
    })
  } catch {}

  revalidatePath('/all')
  revalidatePath('/all/replenish')
}
