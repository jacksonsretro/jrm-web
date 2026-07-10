import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vfrmywbelxsxgqoswemr.supabase.co'
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y5tQrPxbb7N3WKJmpLR05w_H7k2KxrA'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    experimental: { passkey: true },
  },
})

export function internalEmail(username: string): string {
  return `${username.trim().toLowerCase()}@users.jacksonsretro.local`
}
