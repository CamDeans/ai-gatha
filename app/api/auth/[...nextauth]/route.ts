/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

// Export a single handler for all methods
async function auth(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname.replace('/api/auth/', '');
    
    // Create a new request with the required duplex option
    const authRequest = new Request(url, {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
      duplex: 'half'
    } as RequestInit);

    // Add nextauth params
    Object.defineProperty(authRequest, 'query', {
      value: {
        nextauth: pathname.split('/'),
        ...Object.fromEntries(url.searchParams)
      },
      writable: false
    });

    const response = await handler(authRequest);
    return response;
  } catch (error) {
    console.error('NextAuth Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Export all HTTP methods
export const GET = auth;
export const POST = auth;

// Export other methods with proper error handling
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function HEAD() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function OPTIONS() {
  return new Response(null, { 
    status: 200,
    headers: {
      'Allow': 'GET, POST',
      'Content-Length': '0'
    }
  });
}