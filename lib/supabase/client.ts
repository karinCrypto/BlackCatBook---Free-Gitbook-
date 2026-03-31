import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function isSupabaseConfigured() {
  return SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 10
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase가 설정되지 않았습니다. .env.local에 URL과 키를 입력해주세요.')
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
