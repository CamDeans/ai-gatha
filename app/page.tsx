/**
 * Home page component
 * Landing page with authentication options
 */
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            AI|Gatha
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate amazing images with AI
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={() => router.push('/auth/signin')}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
          
          <Button
            onClick={() => router.push('/auth/signup')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Sign Up
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          AI-powered image generation platform
        </p>
      </div>
    </div>
  )
} 