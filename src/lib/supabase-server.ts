import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
