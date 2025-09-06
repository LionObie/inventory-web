// FILE: app/components/TileCard.tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { renameTile, deleteTile } from '@/app/actions/tiles'

export default function TileCard({
  id,
  name,
  href,
  hasLow = false,
}: {
  id: string
  name: string
  href: string
  hasLow?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [localName, setLocalName] = useState(name)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setLocalName(name)
      inputRef.current?.focus()
    }
  }, [editing, name])

  const isDirty = localName.trim() !== name.trim()
  const submit = () => {
    if (!formRef.current || !localName.trim()) return
    formRef.current.requestSubmit()
    setEditing(false)
  }

  return (
    <div className="border rounded p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition">
      <div className="flex-1 min-w-0">
        {editing ? (
          <form
            ref={formRef}
            action={renameTile.bind(null, id)}
            className="max-w-full"
            onSubmit={() => {}}
          >
            <input
              ref={inputRef}
              name="name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={() => isDirty && submit()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="border px-2 py-1 rounded w-full"
              required
            />
            <button type="submit" className="hidden" />
          </form>
        ) : (
          <Link href={href} className="block">
            <span className="font-medium truncate align-middle">{name}</span>
            {hasLow && (
              <span
                className="inline-block align-middle ml-2 w-2.5 h-2.5 bg-red-600 rounded-full"
                aria-label="low stock present"
              />
            )}
          </Link>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-gray-800 text-white px-3 py-1 rounded"
          >
            Edit
          </button>
        )}
        <form action={deleteTile.bind(null, id)} className="inline">
          <button className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
        </form>
      </div>
    </div>
  )
}
