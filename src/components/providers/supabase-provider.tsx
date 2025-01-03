'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient, type Session } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/database.types'

type SupabaseContext = {
  supabase: ReturnType<typeof createClientComponentClient<Database>>
  session: Session | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const [currentSession, setCurrentSession] = useState<Session | null>(session)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setCurrentSession(session)
      
      if (session) {
        // Verify the session with getUser
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          setCurrentSession(null)
          router.replace('/login')
          return
        }
      }

      if (event === 'SIGNED_IN') {
        router.refresh()
      }
      if (event === 'SIGNED_OUT') {
        router.refresh()
        router.replace('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <Context.Provider value={{ supabase, session: currentSession }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}
