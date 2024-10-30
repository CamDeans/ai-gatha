'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-foreground">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-destructive">
            {error === 'CredentialsSignin' 
              ? 'Invalid email or password'
              : 'An error occurred during authentication'}
          </p>
        </div>
        <div className="flex justify-center">
          <Link
            href="/auth/signin"
            className="btn-primary"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  )
} 