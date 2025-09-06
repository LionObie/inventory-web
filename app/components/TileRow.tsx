// FILE: app/components/TileRow.tsx
'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { renameTile, deleteTile } from '../actions/tiles'  // server actions

type Tile = { id: string; name: string }

export default function TileRow({ tile }: { tile: Tile }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(tile.name)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // focus input when entering edit mode
  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  // auto-save helper
  const submit = () => {
    if (!formRef.current) return
    if (name.trim() && name.trim() !== tile.name) {
      formRef.current.requestSubmit()   // triggers server action
    }
    setEditing(false)
  }

  return (
    <li className="border rounded p-3 flex items-center justify-between gap-3">
      {/* Left: open tile */}
      <Link
        href={`/tiles/${tile.id}`}
        className="px-3 py-2 rounded border hover:bg-gray-50 font-medium"
      >
        {tile.name}
      </Link>

      {/* Right: edit / delete */}
      <div className="flex items-center gap-2">
        {editing ? (
          <form
            ref={formRef}
            action={renameTile.bind(null, tile.id)}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setName(tile.name)
                  setEditing(false)
                } else if (e.key === 'Enter') {
                  submit()
                }
              }}
              className="border px-3 py-2 rounded"
              aria-label="Tile name"
              required
            />
            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-gray-800 text-white px-3 py-2 rounded"
          >
            Edit
          </button>
        )}

        <form action={deleteTile.bind(null, tile.id)}>
          <button className="bg-red-600 text-white px-3 py-2 rounded">
            Delete
          </button>
        </form>
      </div>
    </li>
  )
}
