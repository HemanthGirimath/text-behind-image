'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

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

  const handleSocialLogin = (provider: 'github' | 'google') => {
    toast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, {
      description: "We're working hard to bring you more login options. Stay tuned!"
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 py-2">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        <div className="bg-card text-card-foreground p-4 sm:p-8 shadow-sm rounded-lg border">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    brandButtonText: 'hsl(var(--primary-foreground))',
                    defaultButtonBackground: 'hsl(var(--secondary))',
                    defaultButtonBackgroundHover: 'hsl(var(--secondary))',
                    defaultButtonBorder: 'hsl(var(--border))',
                    defaultButtonText: 'hsl(var(--secondary-foreground))',
                    dividerBackground: 'hsl(var(--border))',
                    inputBackground: 'transparent',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--border))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    inputText: 'hsl(var(--foreground))',
                    inputLabelText: 'hsl(var(--muted-foreground))',
                    inputPlaceholder: 'hsl(var(--muted-foreground))',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base',
                input: 'w-full px-3 py-2 sm:px-4 text-sm sm:text-base',
                label: 'text-sm sm:text-base',
                loader: 'dark:invert',
                anchor: 'text-primary hover:text-primary/80',
              },
            }}
            theme="default"
            providers={[]}
            onlyThirdPartyProviders={false}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
          <div className="mt-4 space-y-3">
            <button
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              Continue with GitHub
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
