// server-side only (safe in Vercel server, not browser)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function getSupabaseServer() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
