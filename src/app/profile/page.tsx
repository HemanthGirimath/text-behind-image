"use client"

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { supabase, session } = useSupabase()
  const [userPlan, setUserPlan] = useState('free')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getProfile() {
      try {
        if (!session?.user?.id) {
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          toast.error('Failed to load profile')
          return
        }

        if (data) {
          setUserPlan(data.plan)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [session, supabase])

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <p>{session.user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Current Plan</label>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <Badge variant="outline" className="capitalize">
                {userPlan}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      {!isLoading && userPlan !== 'premium' && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Get access to more features with our premium plans!</p>
            <Link href="/pricing">
              <Button>View Plans</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
