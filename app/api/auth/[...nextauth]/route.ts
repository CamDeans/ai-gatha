/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

// Create a single handler instance
const handler = NextAuth(authConfig);

// Export the handler directly for both GET and POST
export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  try {
    // Check if it's a sign-in request
    const body = await request.clone().json();
    if (body?.email && body?.password) {
      // Add proper headers for authentication requests
      const response = await handler(new Request(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body)
      }));

      // Ensure proper response format
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      return response;
    }

    // Handle other NextAuth requests
    return handler(request);
  } catch (error) {
    console.error('NextAuth POST Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}