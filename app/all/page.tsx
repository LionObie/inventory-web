// FILE: app/all/page.tsx
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ItemsAllTable from './ItemsAllTable'

type JoinedItemRow = {
  id: string
  name: string
  unit: string | null
  on_hand: number | null
  max_capacity: number | null
  alert_level: number | null
  tiles?: { id?: string; name: string }
}

export default async function AllItemsPage() {
  const { data } = await supabase
    .from('items')
    .select('id,name,unit,on_hand,max_capacity,alert_level,tiles!inner(id,name)')
    .order('tiles(name)', { ascending: true })
    .order('name', { ascending: true })

  const items = (data as JoinedItemRow[] | null ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit ?? 'each',
    on_hand: Number(row.on_hand ?? 0),
    max_capacity: Number(row.max_capacity ?? 0),
    alert_level: Number(row.alert_level ?? 0),
    category: row.tiles?.name ?? 'Unknown',
    tile_id: row.tiles?.id,
  }))

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Categories — All Items</h1>
          <p className="text-gray-600">Manage and view all items.</p>
        </div>
        <Link href="/all/replenish" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Replenish List
        </Link>
      </div>

      <ItemsAllTable items={items} />

      <div className="pt-6 flex justify-center">
        <Link href="/" className="border px-4 py-2 rounded">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
