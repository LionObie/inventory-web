// FILE: app/page.tsx
import { supabase } from '@/lib/supabase'
import TileCard from './components/TileCard'
import { createTile } from './actions/tiles'
import Link from 'next/link'
import TilesGrid from './components/TilesGrid' // (we'll add this in part B)

export default async function HomePage() {
  const { data: tiles } = await supabase
    .from('tiles')
    .select('id,name,sort_order')
    .order('sort_order', { ascending: true, nullsFirst: true })
    .order('name', { ascending: true }) // fallback

  const { data: allItems } = await supabase
    .from('items')
    .select('tile_id,on_hand,alert_level')

  const lowByTile = new Map<string, boolean>()
  for (const it of allItems ?? []) {
    const low = Number(it.on_hand ?? 0) <= Number(it.alert_level ?? 0)
    if (low && it.tile_id) lowByTile.set(it.tile_id as string, true)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home Page</h1>
          <p className="text-gray-600">Manage and view categories.</p>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">Add Category</h2>
        <form action={createTile} className="flex gap-2">
          <input
            name="name"
            placeholder="New Category Name"
            className="border px-2 py-2 rounded w-72"
            required
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </form>
      </div>

      {/* Grid: All Categories (wide) + draggable tiles underneath (part B) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/all"
          className="border rounded p-4 bg-gray-100 hover:bg-gray-200 transition block sm:col-span-2"
        >
          <div className="font-semibold">All Categories</div>
          {/* no red dot here by request */}
        </Link>

        {/* Draggable or alphabetical tiles grid */}
        <TilesGrid
          tiles={(tiles ?? []).map((t) => ({
            id: t.id,
            name: t.name,
            hasLow: !!lowByTile.get(t.id),
          }))}
        />
      </div>
    </div>
  )
}
