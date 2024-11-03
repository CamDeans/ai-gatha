/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

// Create a single handler instance
const handler = NextAuth(authConfig);

// Export the handler directly for both GET and POST
export async function GET(req: Request) {
  try {
    return await handler(req);
  } catch (error) {
    console.error('NextAuth GET Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    return await handler(req);
  } catch (error) {
    console.error('NextAuth POST Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}