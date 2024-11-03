/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

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
    const response = await handler(req);
    if (!response) {
      throw new Error('No response from auth handler');
    }
    return response;
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const response = await handler(req);
    if (!response) {
      throw new Error('No response from auth handler');
    }
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