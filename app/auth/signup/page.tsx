/**
 * Sign-up page component
 * Handles new user registration
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      try {
        controller.abort('Request timeout')
      } catch (e) {
        console.error('Abort error:', e)
      }
    }, 15000)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          password 
        }),
        signal: controller.signal
      })

      if (controller.signal.aborted) {
        throw new Error('Request timed out')
      }

      const contentType = res.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text)
        throw new Error('Invalid server response')
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      if (data.success) {
        router.push('/auth/signin?registered=true')
        router.refresh()
      } else {
        throw new Error(data.error || 'Failed to create account')
      }
    } catch (error: unknown) {
      console.error('Signup error:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message === 'Request timed out') {
          setError('Request timed out. Please try again later.')
        } else if (error.message.includes('fetch failed')) {
          setError('Network error. Please check your connection.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
            minLength={6}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/auth/signin" className="text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  )
} 