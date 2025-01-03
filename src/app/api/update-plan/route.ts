import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { plan, payment_id } = await request.json()
    console.log('Received request with plan:', plan, 'payment_id:', payment_id)
    
    // Create supabase client with await
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore,
    })
    
    // Get the current user with getUser() for security
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Authentication error', details: userError }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found')
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Use RLS-enabled query
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single()

    console.log('Fetch profile result:', { existingProfile, fetchError })

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch profile', 
        details: fetchError 
      }, { status: 500 })
    }

    let result;
    const timestamp = new Date().toISOString();
    
    if (!existingProfile) {
      console.log('Creating new profile for user:', user.id)
      result = await supabase
        .from('profiles')
        .insert([{ 
          id: user.id,
          email: user.email,
          plan: plan.toLowerCase(),
          payment_id,
          updated_at: timestamp,
          created_at: timestamp
        }])
        .select()
        .single()
    } else {
      console.log('Updating existing profile for user:', user.id)
      result = await supabase
        .from('profiles')
        .update({ 
          plan: plan.toLowerCase(),
          payment_id,
          updated_at: timestamp
        })
        .eq('id', user.id)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Database operation failed:', result.error)
      return NextResponse.json({ 
        error: 'Failed to update database', 
        details: result.error 
      }, { status: 500 })
    }

    console.log('Successfully updated profile:', result.data)
    return NextResponse.json({ success: true, profile: result.data })
  } catch (error) {
    console.error('Unexpected error in update-plan route:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
