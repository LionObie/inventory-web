// FILE: app/actions/log.ts
'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

type LogEntry = {
  action: string
  entity_type: 'tile' | 'item'
  entity_id?: string | null
  details?: Record<string, unknown>
}

export async function addLog(entry: LogEntry) {
  // Next.js 15: cookies() is async
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...(options ?? {}) })
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...(options ?? {}) })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id ?? null,
    details: entry.details ?? {},
  })
}
