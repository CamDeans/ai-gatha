'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn('google', { callbackUrl })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Button 
        variant="outline" 
        onClick={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <Icons.google className="mr-2 h-4 w-4" />
            Continue with Google
          </>
        )}
      </Button>
    </div>
  )
}