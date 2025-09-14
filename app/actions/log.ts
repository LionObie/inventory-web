// FILE: app/actions/log.ts
'use server'

// Keep the shape so callers don't need to change
export type LogEntry = {
  action: string
  entity_type: 'tile' | 'item'
  entity_id?: string | null
  details?: Record<string, unknown>
}

// No-op for now, so builds never fail here
export async function addLog(_entry: LogEntry) {
  return
}
