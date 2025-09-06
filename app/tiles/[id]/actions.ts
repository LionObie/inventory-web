// FILE: app/tiles/[id]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/** Create a new item (Max/Alert optional) */
export async function createItem(tileId: string, formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const unit = String(formData.get('unit') || 'each').trim()
  const initial_qty = Math.max(0, Number(formData.get('initial_qty') ?? 0))

  const maxRaw = formData.get('max_capacity')
  const alertRaw = formData.get('alert_level')
  const max_capacity = !maxRaw || String(maxRaw).trim() === '' ? 0 : Math.max(0, Number(maxRaw))
  const alert_level = !alertRaw || String(alertRaw).trim() === '' ? 0 : Math.max(0, Number(alertRaw))

  if (!name) redirect(`/tiles/${tileId}?error=Item+name+required`)
  if (alert_level > max_capacity) redirect(`/tiles/${tileId}?error=Alert+cannot+exceed+Max`)

  await supabase.from('items').insert({
    tile_id: tileId,
    name,
    unit,
    max_capacity,
    alert_level,
    on_hand: initial_qty,
  })

  revalidatePath(`/tiles/${tileId}`)
  redirect(`/tiles/${tileId}`)
}

/** Auto-save row edit: updates Item name, On-hand, Unit, Max, Alert */
export async function updateItem(tileId: string, itemId: string, formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const unit = String(formData.get('unit') || '').trim()

  const on_hand = Math.max(0, Number(formData.get('on_hand') || 0))

  const maxRaw = formData.get('max_capacity')
  const alertRaw = formData.get('alert_level')
  const max_capacity = !maxRaw || String(maxRaw).trim() === '' ? 0 : Math.max(0, Number(maxRaw))
  const alert_level = !alertRaw || String(alertRaw).trim() === '' ? 0 : Math.max(0, Number(alertRaw))

  if (!name) redirect(`/tiles/${tileId}?error=Item+name+required`)
  if (alert_level > max_capacity) redirect(`/tiles/${tileId}?error=Alert+cannot+exceed+Max`)
  if (on_hand < 0) redirect(`/tiles/${tileId}?error=On-hand+cannot+be+negative`)

  await supabase
    .from('items')
    .update({ name, unit, on_hand, max_capacity, alert_level })
    .eq('id', itemId)

  revalidatePath(`/tiles/${tileId}`)
  redirect(`/tiles/${tileId}`)
}

/** Adjust stock by qty with + / −; never allow negatives */
export async function adjustStock(tileId: string, itemId: string, formData: FormData) {
  const qty = Math.max(1, Number(formData.get('qty') || 0))
  const op = String(formData.get('op') || 'plus') as 'plus' | 'minus'

  const { data: item, error } = await supabase
    .from('items')
    .select('on_hand')
    .eq('id', itemId)
    .single()

  if (error || !item) redirect(`/tiles/${tileId}?error=Item+not+found`)

  const current = item.on_hand ?? 0
  const newQty = op === 'plus' ? current + qty : current - qty
  if (newQty < 0) redirect(`/tiles/${tileId}?error=Cannot+book+out+more+than+on-hand`)

  await supabase.from('items').update({ on_hand: newQty }).eq('id', itemId)
  revalidatePath(`/tiles/${tileId}`)
  redirect(`/tiles/${tileId}`)
}

/** Delete an item */
export async function deleteItem(tileId: string, itemId: string) {
  await supabase.from('items').delete().eq('id', itemId)
  revalidatePath(`/tiles/${tileId}`)
  redirect(`/tiles/${tileId}`)
}
