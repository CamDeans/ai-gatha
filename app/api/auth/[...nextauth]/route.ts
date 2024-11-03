/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';
import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

// Create handler with timeout
const TIMEOUT = 10000; // 10 seconds

// Create handler with proper types
const handler = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      try {
        const result = await Promise.race([
          authConfig.callbacks?.jwt?.({ token, user, account, profile, trigger }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), TIMEOUT)
          )
        ]);
        return result || token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token, user, trigger }) {
      try {
        const result = await Promise.race([
          authConfig.callbacks?.session?.({ session, token, user, trigger }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), TIMEOUT)
          )
        ]);
        return result || session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    }
  }
});

// Helper function for error responses
function handleError(error: unknown) {
  console.error('NextAuth Error:', error);
  return NextResponse.json(
    { error: 'Authentication failed' },
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Export handlers with error handling
export async function GET(req: Request) {
  try {
    const response = await Promise.race([
      handler(req),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT)
      )
    ]);
    return response;
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const response = await Promise.race([
      handler(req),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT)
      )
    ]);
    return response;
  } catch (error) {
    return handleError(error);
  }
}

// Export other methods
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;