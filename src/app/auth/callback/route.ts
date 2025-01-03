import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Session exchange error:', error)
        return NextResponse.redirect(new URL('/login', requestUrl.origin))
      }

      // Successful authentication - redirect to editor
      return NextResponse.redirect(new URL('/editor', requestUrl.origin))
    }

    // No code - redirect to login
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
