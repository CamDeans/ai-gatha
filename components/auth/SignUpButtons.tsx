'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SignUpButtons() {
  const [isLoading, setIsLoading] = useState<{
    google?: boolean;
    github?: boolean;
  }>({})
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const initializeUserSettings = async () => {
    try {
      const response = await fetch('/api/user/initialize', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to initialize user settings');
      }
    } catch (error) {
      console.error('Error initializing user settings:', error);
      toast.error('Failed to initialize user settings');
    }
  };

  const handleSignUp = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(prev => ({ ...prev, [provider]: true }))
      const result = await signIn(provider, {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.url) {
        // Initialize user settings after successful sign-in
        await initializeUserSettings();
        router.push(result.url)
      }
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Sign up failed. Please try again.'
      )
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }))
    }
  }

  return (
    <div className="grid gap-4">
      <Button 
        onClick={() => handleSignUp('google')}
        disabled={isLoading.google}
        className="bg-primary text-primary-foreground shadow hover:bg-primary/90"
        size="lg"
      >
        {isLoading.google ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Sign up with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button 
        onClick={() => handleSignUp('github')}
        disabled={isLoading.github}
        className="bg-primary text-primary-foreground shadow hover:bg-primary/90"
        size="lg"
      >
        {isLoading.github ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}
        Sign up with GitHub
      </Button>
    </div>
  )
} 