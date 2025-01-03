"use client"

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { ThemeToggle } from './theme-toggle'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserCircle } from 'lucide-react'
import { useSupabase } from './providers/supabase-provider'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { supabase, session } = useSupabase()
  const [user, setUser] = useState<User | null>(session?.user ?? null)

  useEffect(() => {
    setUser(session?.user ?? null)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [session, supabase.auth])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const truncateEmail = (email: string) => {
    if (!email) return ''
    const [username, domain] = email.split('@')
    if (username.length <= 8) return email
    return `${username.slice(0, 8)}...@${domain}`
  }

  // Don't show navbar on landing page
  if (pathname === '/') return null

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link 
            href={user ? "/editor" : "/"}
            className="flex items-center space-x-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <span>Text-Behind-Image</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {!user ? (
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            ) : (
              <>
                <Link href="/editor">
                  <Button variant="ghost">Editor</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          {user.email ? user.email[0].toUpperCase() : <UserCircle className="h-6 w-6" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.email && (
                          <p className="font-medium">{truncateEmail(user.email)}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/editor">Editor</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
