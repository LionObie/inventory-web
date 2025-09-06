// FILE: app/tiles/[id]/replenish/page.tsx
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ReplenishTable from './ReplenishTable'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ReplenishPage({ params }: PageProps) {
  const { id: tileId } = await params

  const { data: tile } = await supabase.from('tiles').select('*').eq('id', tileId).single()
  if (!tile) {
    return (
      <div className="p-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-700 hover:underline">← Back to Home</Link>
        </div>
        <div>Tile not found.</div>
      </div>
    )
  }

  const { data: items } = await supabase
    .from('items')
    .select('id,name,unit,on_hand,max_capacity,alert_level')
    .eq('tile_id', tileId)
    .order('name', { ascending: true })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="">
        <h1 className="text-2xl font-bold">Replenish List — {tile.name}</h1>
        <p className="text-gray-600">View, edit and export replenish list.</p>
      </div>

      <ReplenishTable
        tileName={tile.name}
        items={(items ?? []).map((it) => ({
          id: it.id,
          name: it.name,
          unit: it.unit ?? 'each',
          on_hand: Number(it.on_hand ?? 0),
          max_capacity: Number(it.max_capacity ?? 0),
          alert_level: Number(it.alert_level ?? 0),
        }))}
      />

      {/* Bottom-centered navigation */}
      <div className="pt-6 flex justify-center">
        <div className="flex gap-3">
          <Link href={`/tiles/${tileId}`} className="border px-4 py-2 rounded">
            Back to Items
          </Link>
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
