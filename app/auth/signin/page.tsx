/**
 * Sign-in page component
 * Handles user authentication with email/password
 */
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
} 