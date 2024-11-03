/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

// Helper function to get nextauth params from URL
function getNextAuthParams(url: string) {
  const segments = url.split('/');
  const nextauthIndex = segments.indexOf('auth') + 1;
  return segments.slice(nextauthIndex);
}

// Export handlers
export async function GET(request: NextRequest) {
  try {
    const nextauthParams = getNextAuthParams(request.url);
    const searchParams = new URL(request.url).searchParams;

    // Create a new request with the same properties
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      cache: request.cache,
      credentials: request.credentials,
    });

    // Add query property
    Object.defineProperty(newRequest, 'query', {
      value: {
        nextauth: nextauthParams,
        ...Object.fromEntries(searchParams.entries())
      },
      writable: false
    });

    return await handler(newRequest);
  } catch (error) {
    console.error('NextAuth GET Error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const nextauthParams = getNextAuthParams(request.url);
    const searchParams = new URL(request.url).searchParams;
    const body = await request.text();

    // Create a new request with the same properties
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: new Headers({
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers)
      }),
      body
    } as RequestInit);

    // Add query property
    Object.defineProperty(newRequest, 'query', {
      value: {
        nextauth: nextauthParams,
        ...Object.fromEntries(searchParams.entries())
      },
      writable: false
    });

    return await handler(newRequest);
  } catch (error) {
    console.error('NextAuth POST Error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500 }
    );
  }
}

// Export other methods with proper error handling
export async function PUT() {
  return new Response(null, { status: 405 });
}

export async function PATCH() {
  return new Response(null, { status: 405 });
}

export async function DELETE() {
  return new Response(null, { status: 405 });
}

export async function HEAD() {
  return new Response(null, { status: 405 });
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