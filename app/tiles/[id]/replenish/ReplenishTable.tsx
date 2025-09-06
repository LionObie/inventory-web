// FILE: app/tiles/[id]/replenish/ReplenishTable.tsx
'use client'

import { useMemo, useState } from 'react'

type Item = {
  id: string
  name: string
  unit: string
  on_hand: number
  max_capacity: number
  alert_level: number
}

export default function ReplenishTable({
  tileId,
  tileName,
  items,
}: {
  tileId: string
  tileName: string
  items: Item[]
}) {
  const [query, setQuery] = useState('')
  const [onlyBelowAlert, setOnlyBelowAlert] = useState(false)
  const [needOverrides, setNeedOverrides] = useState<Record<string, number | ''>>({})

  const base = useMemo(
    () => (items || []).filter((it) => it.max_capacity > 0 && it.on_hand < it.max_capacity),
    [items]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return base.filter((it) => {
      const nameMatch = !q || it.name.toLowerCase().includes(q)
      const alertMatch = !onlyBelowAlert || it.on_hand <= it.alert_level
      return nameMatch && alertMatch
    })
  }, [base, query, onlyBelowAlert])

  const rows = filtered.map((it) => {
    const defaultNeed = Math.max(0, it.max_capacity - it.on_hand)
    const override = needOverrides[it.id]
    const need = clampNonNegative(
      override === undefined ? defaultNeed : override === '' ? 0 : Number(override)
    )
    return { ...it, defaultNeed, need }
  })

  const totalNeed = rows.reduce((sum, r) => sum + r.need, 0)

  function setOverride(id: string, val: string) {
    if (val === '') {
      setNeedOverrides((p) => ({ ...p, [id]: '' }))
      return
    }
    const n = Number(val)
    if (Number.isNaN(n) || n < 0) return
    setNeedOverrides((p) => ({ ...p, [id]: n }))
  }

  function exportCSV() {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const filename = `replenish_${slugify(tileName)}_${yyyy}-${mm}-${dd}.csv`

    const header = ['Item', 'On-hand', 'Unit', 'Max', 'Alert', 'Need']
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [csvEscape(r.name), String(r.on_hand), csvEscape(r.unit), String(r.max_capacity), String(r.alert_level), String(r.need)].join(',')
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function copyToClipboard() {
    const header = ['Item', 'On-hand', 'Unit', 'Max', 'Alert', 'Need']
    const lines = [
      header.join('\t'),
      ...rows.map((r) => [r.name, r.on_hand, r.unit, r.max_capacity, r.alert_level, r.need].join('\t')),
    ]
    const text = lines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      alert('Replenish list copied to clipboard.')
    } catch {
      alert('Could not copy. Your browser may block clipboard access.')
    }
  }

  function printList() {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <html>
        <head>
          <title>Replenish List — ${escapeHtml(tileName)}</title>
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f7f7f7; text-align: left; }
            tfoot td { font-weight: 600; }
          </style>
        </head>
        <body>
          <h2>Replenish List — ${escapeHtml(tileName)}</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>On-hand</th>
                <th>Unit</th>
                <th>Max</th>
                <th>Alert</th>
                <th>Need</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r) => `
                <tr>
                  <td>${escapeHtml(r.name)}</td>
                  <td style="text-align:right">${r.on_hand}</td>
                  <td>${escapeHtml(r.unit)}</td>
                  <td style="text-align:right">${r.max_capacity}</td>
                  <td style="text-align:right">${r.alert_level}</td>
                  <td style="text-align:right">${r.need}</td>
                </tr>`
                )
                .join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="text-align:right">Total Need</td>
                <td style="text-align:right">${totalNeed}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `)
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by item name..."
          className="border px-3 py-2 rounded w-64"
          aria-label="Filter by item name"
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyBelowAlert}
            onChange={(e) => setOnlyBelowAlert(e.target.checked)}
          />
          Only items at/below Alert
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded">
            Export CSV
          </button>
          <button onClick={copyToClipboard} className="bg-gray-800 text-white px-4 py-2 rounded">
            Copy
          </button>
          <button onClick={printList} className="border px-4 py-2 rounded">
            Print
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">On-hand</th>
              <th className="p-2">Unit</th>
              <th className="p-2 text-right">Max</th>
              <th className="p-2 text-right">Alert</th>
              <th className="p-2 text-right">Need</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2 text-right">{r.on_hand}</td>
                <td className="p-2">{r.unit}</td>
                <td className="p-2 text-right">{r.max_capacity}</td>
                <td className="p-2 text-right">{r.alert_level}</td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    min={0}
                    value={needOverrides[r.id] === undefined ? r.defaultNeed : needOverrides[r.id]}
                    onChange={(e) => setOverride(r.id, e.target.value)}
                    className="border px-2 py-1 rounded w-24 text-right"
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={6}>
                  Nothing to replenish based on your filters.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t">
                <td className="p-2 text-right font-semibold" colSpan={5}>
                  Total Need
                </td>
                <td className="p-2 text-right font-semibold">{totalNeed}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

/* helpers */
function csvEscape(s: string) {
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
function clampNonNegative(n: number) {
  return n < 0 ? 0 : n
}
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
