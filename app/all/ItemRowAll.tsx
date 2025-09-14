// FILE: app/all/ItemRowAll.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { adjustItemAll, deleteItemAll, updateItemAll } from './actions'
import Link from 'next/link'

export type ItemAll = {
  id: string
  name: string
  unit: string
  on_hand: number
  max_capacity: number
  alert_level: number
  category: string
  // Make optional to match ItemsAllTable
  tile_id?: string
}

export default function ItemRowAll({ item }: { item: ItemAll }) {
  const [editing, setEditing] = useState(false)
  const [localName, setLocalName] = useState(item.name)
  const [onHand, setOnHand] = useState<number | ''>(item.on_hand)
  const [unit, setUnit] = useState(item.unit)
  const [maxCap, setMaxCap] = useState<number | ''>(item.max_capacity)
  const [alert, setAlert] = useState<number | ''>(item.alert_level)
  const [qty, setQty] = useState<number | ''>('')

  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const isDirty =
    localName.trim() !== item.name.trim() ||
    onHand !== item.on_hand ||
    unit !== item.unit ||
    maxCap !== item.max_capacity ||
    alert !== item.alert_level

  function submit() {
    if (!isDirty || !formRef.current) return
    formRef.current.requestSubmit()
    setEditing(false)
  }

  async function onAdjust(sign: '+' | '-') {
    if (qty === '' || Number.isNaN(Number(qty))) return
    const delta = sign === '+' ? Number(qty) : -Number(qty)
    await adjustItemAll(item.id, delta)
    setQty('')
  }

  return (
    <tr className="border-t">
      {/* Category */}
      <td className="p-2">
        {/* Only link to the tile if we actually have a tile_id */}
        {item.tile_id ? (
          <Link href={`/tiles/${item.tile_id}`} className="underline">
            {item.category}
          </Link>
        ) : (
          <span>{item.category}</span>
        )}
      </td>

      {/* Item / editable name */}
      <td className="p-2">
        {editing ? (
          <form ref={formRef} action={updateItemAll.bind(null, item.id)} onSubmit={() => {}}>
            <input
              ref={inputRef}
              name="name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="border px-2 py-1 rounded w-full"
              required
            />
            <input type="hidden" name="unit" value={unit} />
            <input type="hidden" name="on_hand" value={onHand === '' ? 0 : onHand} />
            <input type="hidden" name="max_capacity" value={maxCap === '' ? 0 : maxCap} />
            <input type="hidden" name="alert_level" value={alert === '' ? 0 : alert} />
            <button type="submit" className="hidden" />
          </form>
        ) : (
          <span>{item.name}</span>
        )}
      </td>

      {/* On-hand + low dot */}
      <td className="p-2 text-right">
        {editing ? (
          <input
            type="number"
            min={0}
            value={onHand}
            onChange={(e) => setOnHand(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={submit}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="border px-2 py-1 rounded w-24 text-right"
          />
        ) : (
          <div className="inline-flex items-center gap-2 justify-end">
            <span>{item.on_hand}</span>
            {Number(item.on_hand ?? 0) <= Number(item.alert_level ?? 0) && (
              <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" aria-label="low stock" />
            )}
          </div>
        )}
      </td>

      {/* Unit */}
      <td className="p-2">
        {editing ? (
          <input
            name="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onBlur={submit}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="border px-2 py-1 rounded w-24"
          />
        ) : (
          item.unit
        )}
      </td>

      {/* Max */}
      <td className="p-2 text-right">
        {editing ? (
          <input
            type="number"
            min={0}
            value={maxCap}
            onChange={(e) => setMaxCap(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={submit}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="border px-2 py-1 rounded w-24 text-right"
          />
        ) : (
          item.max_capacity
        )}
      </td>

      {/* Alert */}
      <td className="p-2 text-right">
        {editing ? (
          <input
            type="number"
            min={0}
            value={alert}
            onChange={(e) => setAlert(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={submit}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="border px-2 py-1 rounded w-24 text-right"
          />
        ) : (
          item.alert_level
        )}
      </td>

      {/* Adjust */}
      <td className="p-2 text-right">
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
            className="border px-2 py-1 rounded w-20 text-right"
            placeholder="Qty"
          />
          <button onClick={() => onAdjust('+')} className="bg-green-600 text-white px-3 py-1 rounded">+</button>
          <button onClick={() => onAdjust('-')} className="bg-red-600 text-white px-3 py-1 rounded">-</button>
        </div>
      </td>

      {/* Actions */}
      <td className="p-2 text-right">
        {editing ? (
          <button onClick={submit} className="border px-3 py-1 rounded">Save</button>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setEditing(true)} className="bg-gray-800 text-white px-3 py-1 rounded">Edit</button>
            <form action={deleteItemAll.bind(null, item.id)} className="inline">
              <button className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
            </form>
          </div>
        )}
      </td>
    </tr>
  )
}
