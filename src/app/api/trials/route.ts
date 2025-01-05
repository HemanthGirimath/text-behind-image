import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: trials } = await supabase
      .from('user_trials')
      .select('trial_count')
      .eq('user_id', session.user.id)
      .single()

    return NextResponse.json({ trialCount: trials?.trial_count || 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current trial count
    const { data: existingTrials } = await supabase
      .from('user_trials')
      .select('trial_count')
      .eq('user_id', session.user.id)
      .single()

    if (existingTrials) {
      // Update existing record
      const newCount = existingTrials.trial_count + 1
      if (newCount > 3) {
        return NextResponse.json({ error: 'Trial limit exceeded' }, { status: 403 })
      }

      const { error } = await supabase
        .from('user_trials')
        .update({ trial_count: newCount })
        .eq('user_id', session.user.id)

      if (error) throw error
      return NextResponse.json({ trialCount: newCount })
    } else {
      // Create new record
      const { error } = await supabase
        .from('user_trials')
        .insert([{ user_id: session.user.id, trial_count: 1 }])

      if (error) throw error
      return NextResponse.json({ trialCount: 1 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
