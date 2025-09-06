// FILE: app/tiles/[id]/page.tsx
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { createItem } from './actions'
import ItemsTable from './ItemsTable'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function TilePage({ params, searchParams }: PageProps) {
  const { id: tileId } = await params
  const sp = (await searchParams) ?? {}
  const errorMsg = (typeof sp.error === 'string' && sp.error) || ''

  // Get tile
  const { data: tile } = await supabase.from('tiles').select('*').eq('id', tileId).single()
  if (!tile) return <div className="p-8">Tile not found.</div>

  // Get items
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('tile_id', tileId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header with top-right Create Replenish List */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tile.name}</h1>
          <p className="text-gray-600">Manage and view items in category.</p>
        </div>
        <Link
          href={`/tiles/${tileId}/replenish`}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Replenish List
        </Link>
      </div>

      {/* Error message */}
      {errorMsg ? (
        <div className="border border-red-300 bg-red-50 text-red-700 px-3 py-2 rounded">
          {errorMsg}
        </div>
      ) : null}

      {/* Add Item */}
      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">Add Item</h2>
        <form action={createItem.bind(null, tileId)} className="grid grid-cols-6 gap-2">
          <input
            name="name"
            placeholder="Item Name"
            className="border px-2 py-2 rounded col-span-2"
            required
          />
          <input
            name="initial_qty"
            type="number"
            min="0"
            placeholder="Quantity"
            className="border px-2 py-2 rounded"
            defaultValue={0}
            required
          />
          <input
            name="unit"
            placeholder="Unit (e.g. each)"
            className="border px-2 py-2 rounded"
            defaultValue="each"
          />
          <input
            name="max_capacity"
            type="number"
            min="0"
            placeholder="Max (optional)"
            className="border px-2 py-2 rounded"
          />
          <input
            name="alert_level"
            type="number"
            min="0"
            placeholder="Alert (optional)"
            className="border px-2 py-2 rounded"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded col-span-6">
            Add Item
          </button>
        </form>
      </div>

      {/* Items table */}
      <ItemsTable tileId={tileId} items={items ?? []} />

      {/* Bottom-centered navigation */}
      <div className="pt-6 flex justify-center">
        <Link href="/" className="border px-4 py-2 rounded">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
