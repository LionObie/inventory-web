// FILE: app/components/TilesGrid.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import TileCard from './TileCard'
import { reorderTiles } from '@/app/actions/tiles'

type Tile = { id: string; name: string; hasLow?: boolean }

export default function TilesGrid({ tiles }: { tiles: Tile[] }) {
  const [order, setOrder] = useState<Tile[]>(tiles)
  const dragIndex = useRef<number | null>(null)
  const overIndex = useRef<number | null>(null)
  const submitRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOrder(tiles)
  }, [tiles])

  function onDragStart(e: React.DragEvent, index: number) {
    dragIndex.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    overIndex.current = index
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const from = dragIndex.current
    const to = overIndex.current
    dragIndex.current = null
    overIndex.current = null
    if (from === null || to === null || from === to) return

    setOrder((prev) => {
      const next = prev.slice()
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      // auto-save
      queueMicrotask(() => {
        if (inputRef.current && submitRef.current) {
          inputRef.current.value = JSON.stringify(next.map((t) => t.id))
          submitRef.current.requestSubmit()
        }
      })
      return next
    })
  }

  return (
    <>
      {/* hidden form to persist order */}
      <form ref={submitRef} action={reorderTiles} className="hidden">
        <input ref={inputRef} type="hidden" name="order" />
        <button type="submit" />
      </form>

      {order.map((t, idx) => (
        <div
          key={t.id}
          draggable
          onDragStart={(e) => onDragStart(e, idx)}
          onDragOver={(e) => onDragOver(e, idx)}
          onDrop={onDrop}
          className="cursor-move"
          title="Drag to reorder"
        >
          <TileCard id={t.id} name={t.name} href={`/tiles/${t.id}`} hasLow={t.hasLow} />
        </div>
      ))}
    </>
  )
}
