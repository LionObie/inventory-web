// FILE: app/all/replenish/page.tsx
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ReplenishTableAll from './ReplenishTableAll'

type JoinedItemRow = {
  id: string
  name: string
  unit: string | null
  on_hand: number | null
  max_capacity: number | null
  alert_level: number | null
  tiles?: { name: string }
}

export default async function ReplenishAllPage() {
  const { data } = await supabase
    .from('items')
    .select('id,name,unit,on_hand,max_capacity,alert_level,tiles!inner(name)')
    .order('tiles(name)', { ascending: true })
    .order('name', { ascending: true })

  const rows = (data ?? []) as JoinedItemRow[]

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit ?? 'each',
    on_hand: Number(row.on_hand ?? 0),
    max_capacity: Number(row.max_capacity ?? 0),
    alert_level: Number(row.alert_level ?? 0),
    category: row.tiles?.name ?? 'Unknown',
  }))

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Replenish List — All Categories</h1>
        <p className="text-gray-600">View, edit and export replenish list.</p>
      </div>

      <ReplenishTableAll items={items} />

      <div className="pt-6 flex justify-center">
        <div className="flex gap-3">
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
