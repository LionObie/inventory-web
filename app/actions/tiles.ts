// FILE: app/actions/tiles.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '../../lib/supabase'

export async function createTile(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  if (!name) return
  await supabase.from('tiles').insert({ name })
  revalidatePath('/')
}

export async function renameTile(id: string, formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  if (!name) return
  await supabase.from('tiles').update({ name }).eq('id', id)
  revalidatePath('/')
}

export async function deleteTile(id: string) {
  await supabase.from('tiles').delete().eq('id', id)
  revalidatePath('/')
}

export async function reorderTiles(formData: FormData) {
  const json = String(formData.get('order') || '[]')
  let ids: string[] = []
  try { ids = JSON.parse(json) } catch {}

  for (let i = 0; i < ids.length; i++) {
    await supabase.from('tiles').update({ sort_order: i + 1 }).eq('id', ids[i])
  }
  revalidatePath('/')
}