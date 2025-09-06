// FILE: app/tiles/[id]/ItemRow.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { adjustStock, deleteItem, updateItem } from './actions'

type Item = {
  id: string
  name: string
  unit: string
  max_capacity: number
  alert_level: number
  on_hand: number
}

export default function ItemRow({ tileId, item }: { tileId: string; item: Item }) {
  const [editing, setEditing] = useState(false)

  // Local editable state
  const [name, setName] = useState(item.name)
  const [onHand, setOnHand] = useState<number | ''>(item.on_hand ?? 0)
  const [unit, setUnit] = useState(item.unit ?? '')
  const [maxCap, setMaxCap] = useState<number | ''>(item.max_capacity ?? 0)
  const [alert, setAlert] = useState<number | ''>(item.alert_level ?? 0)

  // Adjust qty (for +/-)
  const [qty, setQty] = useState<number | ''>('')

  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      // reset state to latest item values when entering edit mode
      setName(item.name)
      setOnHand(item.on_hand ?? 0)
      setUnit(item.unit ?? '')
      setMaxCap(item.max_capacity ?? 0)
      setAlert(item.alert_level ?? 0)
      nameRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  // helper: submit the form (auto-save)
  const submit = () => {
    if (!formRef.current) return
    // Avoid submitting if name empty
    if (!String(name).trim()) return
    formRef.current.requestSubmit()
    // We keep edit mode on; the page will refresh after server action redirect.
  }

  // helper: compare to original to avoid unnecessary submit
  const isDirty =
    name !== item.name ||
    (onHand === '' ? 0 : onHand) !== (item.on_hand ?? 0) ||
    unit !== (item.unit ?? '') ||
    (maxCap === '' ? 0 : maxCap) !== (item.max_capacity ?? 0) ||
    (alert === '' ? 0 : alert) !== (item.alert_level ?? 0)

  return (
    <tr className="border-t align-top">
      {/* Item (name) */}
      <td className="p-2">
        {editing ? (
          <form
            ref={formRef}
            action={updateItem.bind(null, tileId, item.id)}
            className="contents"
            onSubmit={() => {
              /* after submit, server action redirects & revalidates */
            }}
          >
            {/* Visible editable inputs */}
            <input
              ref={nameRef}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => isDirty && submit()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="border px-2 py-1 rounded w-full"
              required
            />

            {/* Hidden inputs so the same form carries all fields every submit */}
            <input type="hidden" name="on_hand" value={String(onHand === '' ? 0 : onHand)} />
            <input type="hidden" name="unit" value={String(unit)} />
            <input type="hidden" name="max_capacity" value={String(maxCap === '' ? 0 : maxCap)} />
            <input type="hidden" name="alert_level" value={String(alert === '' ? 0 : alert)} />

            {/* Hidden submit button (used by requestSubmit) */}
            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        ) : (
          <span className="font-medium">{item.name}</span>
        )}
      </td>

      {/* On-hand */}
      <td className="p-2 text-right">
        {editing ? (
          <input
            type="number"
            min={0}
            value={onHand}
            onChange={(e) => setOnHand(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={() => isDirty && submit()}
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
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onBlur={() => isDirty && submit()}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="border px-2 py-1 rounded w-28"
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
            onBlur={() => isDirty && submit()}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="border px-2 py-1 rounded w-24 text-right"
            placeholder="0"
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
            onBlur={() => isDirty && submit()}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="border px-2 py-1 rounded w-24 text-right"
            placeholder="0"
          />
        ) : (
          item.alert_level
        )}
      </td>

      {/* Adjust column: qty + +/- */}
      <td className="p-2 text-right">
        <form action={adjustStock.bind(null, tileId, item.id)} className="inline-flex items-center gap-2">
          <input
            name="qty"
            type="number"
            min="1"
            placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
            className="border px-2 py-1 rounded w-24 text-right"
            required
          />
          <button name="op" value="plus" className="bg-green-600 text-white px-3 py-1 rounded">
            +
          </button>
          <button name="op" value="minus" className="bg-orange-600 text-white px-3 py-1 rounded">
            −
          </button>
        </form>
      </td>

      {/* Actions column: only Edit and Delete */}
      <td className="p-2 text-right space-x-2">
        {!editing && (
          <button onClick={() => setEditing(true)} className="bg-gray-800 text-white px-3 py-1 rounded">
            Edit
          </button>
        )}
        <form action={deleteItem.bind(null, tileId, item.id)} className="inline">
          <button className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
        </form>
      </td>
    </tr>
  )
}
