'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const redirectTo = searchParams.get('redirect') || '/editor'
          router.push(redirectTo)
        }
      } catch (error) {
        console.error('Session check error:', error)
      }
    }

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const redirectTo = searchParams.get('redirect') || '/editor'
        router.push(redirectTo)
      }
    })

    checkSession()

    return () => {
      authListener?.unsubscribe()
    }
  }, [supabase, router, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Sign in to continue to your account
          </p>
        </div>

        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{
              extend: true,
              className: {
                input: 'supabase-auth-ui_ui-input'
              },
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                    inputBackground: '#1a1a1a',
                    inputText: '#ffffff',
                    inputBorder: '#333333',
                  },
                },
              },
            }}
            theme="dark"
            showLinks={true}
            providers={['github', 'google']}
            redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
          />
        </div>
      </div>
    </div>
  )
}
