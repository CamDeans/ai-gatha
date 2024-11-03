/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

// Create handler with timeout
const TIMEOUT = 10000; // 10 seconds

const handler = NextAuth({
  ...authConfig,
  async callbacks(params) {
    // Add timeout to all callbacks
    const result = await Promise.race([
      authConfig.callbacks?.[params.type]?.(params),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), TIMEOUT)
      )
    ]);
    return result;
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