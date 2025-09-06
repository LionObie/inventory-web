// FILE: app/all/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/** Update (auto-save) for All view: Item, On-hand, Unit, Max, Alert */
export async function updateItemAll(itemId: string, formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const unit = String(formData.get('unit') || '').trim()

  const on_hand = Math.max(0, Number(formData.get('on_hand') || 0))

  const maxRaw = formData.get('max_capacity')
  const alertRaw = formData.get('alert_level')
  const max_capacity = !maxRaw || String(maxRaw).trim() === '' ? 0 : Math.max(0, Number(maxRaw))
  const alert_level = !alertRaw || String(alertRaw).trim() === '' ? 0 : Math.max(0, Number(alertRaw))

  if (!name) redirect(`/all?error=Item+name+required`)
  if (alert_level > max_capacity) redirect(`/all?error=Alert+cannot+exceed+Max`)
  if (on_hand < 0) redirect(`/all?error=On-hand+cannot+be+negative`)

  await supabase
    .from('items')
    .update({ name, unit, on_hand, max_capacity, alert_level })
    .eq('id', itemId)

  revalidatePath('/all')
  redirect('/all')
}

/** Adjust stock in All view: +/- qty, never below zero */
export async function adjustStockAll(itemId: string, formData: FormData) {
  const qty = Math.max(1, Number(formData.get('qty') || 0))
  const op = String(formData.get('op') || 'plus') as 'plus' | 'minus'

  const { data: item, error } = await supabase
    .from('items')
    .select('on_hand')
    .eq('id', itemId)
    .single()

  if (error || !item) redirect(`/all?error=Item+not+found`)

  const current = item.on_hand ?? 0
  const next = op === 'plus' ? current + qty : current - qty
  if (next < 0) redirect(`/all?error=Cannot+book+out+more+than+on-hand`)

  await supabase.from('items').update({ on_hand: next }).eq('id', itemId)

  revalidatePath('/all')
  redirect('/all')
}

/** Delete an item from All view */
export async function deleteItemAll(itemId: string) {
  await supabase.from('items').delete().eq('id', itemId)
  revalidatePath('/all')
  redirect('/all')
}
