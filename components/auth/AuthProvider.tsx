'use client'

import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"
import type { Session } from "next-auth"

interface AuthProviderProps extends PropsWithChildren {
  session: Session | null
}

/**
 * AuthProvider component that wraps the application with SessionProvider
 * Handles session state and revalidation
 */
export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider 
      session={session}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  )
} 