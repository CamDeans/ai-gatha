/**
 * Type declarations for NextAuth
 * Extends the default NextAuth types with custom user properties
 */
import 'next-auth'
import { DefaultSession } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Extends the built-in Session type
   * Adds custom user properties
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }

  /**
   * Extends the built-in User type
   * Adds custom user properties
   */
  interface User {
    id: string
    email: string
    name?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    email: string
    name?: string | null
  }
} 