// FILE: app/all/ItemsAllTable.tsx
'use client'

import { useMemo, useState } from 'react'
import ItemRowAll from './ItemRowAll'

type RowItem = {
  id: string
  name: string
  unit: string
  max_capacity: number
  alert_level: number
  on_hand: number
  category: string
  tile_id: string
}

export default function ItemsAllTable({ items }: { items: RowItem[] }) {
  const [query, setQuery] = useState('')
  const [belowMax, setBelowMax] = useState(false)
  const [belowAlert, setBelowAlert] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (items || []).filter((it) => {
      const hay = `${it.category} ${it.name}`.toLowerCase()
      const nameMatch = !q || hay.includes(q)
      const maxMatch = !belowMax || (it.max_capacity > 0 && (it.on_hand ?? 0) < (it.max_capacity ?? 0))
      const alertMatch = !belowAlert || (it.on_hand ?? 0) <= (it.alert_level ?? 0)
      return nameMatch && maxMatch && alertMatch
    })
  }, [items, query, belowMax, belowAlert])

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by category or item name..."
          className="border px-3 py-2 rounded w-80"
          aria-label="Filter by category or item name"
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={belowMax} onChange={(e) => setBelowMax(e.target.checked)} />
          Below Max
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={belowAlert} onChange={(e) => setBelowAlert(e.target.checked)} />
          Below Alert
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">On-hand</th>
              <th className="p-2">Unit</th>
              <th className="p-2 text-right">Max</th>
              <th className="p-2 text-right">Alert</th>
              <th className="p-2 text-right">Adjust</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <ItemRowAll key={it.id} item={it} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={8}>
                  No items match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
