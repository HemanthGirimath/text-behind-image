"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from './providers/supabase-provider'
import { Loader2 } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { supabase, session } = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!session) {
          router.replace('/login')
          return
        }

        // Only check profile if we have a session
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist
            console.log('No profile found, redirecting to signup')
            await supabase.auth.signOut()
            router.replace('/signup')
            return
          }
          // Other errors - don't redirect, just log
          console.error('Profile fetch error:', profileError)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsLoading(false) // Still show content on error
      }
    }

    checkAuth()
  }, [supabase, router, session])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
