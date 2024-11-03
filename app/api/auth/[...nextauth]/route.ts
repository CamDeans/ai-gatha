/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

// Helper function to create a proper request object
async function createAuthRequest(request: NextRequest) {
  const url = new URL(request.url);
  const nextauthParams = url.pathname
    .split('/')
    .filter(param => param !== '' && param !== 'api' && param !== 'auth');

  let body = null;
  if (request.body) {
    try {
      const text = await request.text();
      if (text) {
        body = text;
      }
    } catch (error) {
      console.error('Error reading request body:', error);
    }
  }

  const authRequest = new Request(url, {
    method: request.method,
    headers: new Headers(request.headers),
    body,
    duplex: 'half',
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    keepalive: request.keepalive,
    mode: request.mode,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    signal: request.signal,
  });

  // Add nextauth params to request
  Object.defineProperty(authRequest, 'query', {
    get: () => ({
      nextauth: nextauthParams,
      ...Object.fromEntries(url.searchParams)
    }),
    enumerable: true,
    configurable: true
  });

  return authRequest;
}

// Export handlers
export async function GET(request: NextRequest) {
  try {
    const authRequest = await createAuthRequest(request);
    return await handler(authRequest);
  } catch (error) {
    console.error('NextAuth GET Error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authRequest = await createAuthRequest(request);
    return await handler(authRequest);
  } catch (error) {
    console.error('NextAuth POST Error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Export other methods with proper error handling
export async function PUT(request: NextRequest) {
  return new Response(null, { status: 405 });
}

export async function PATCH(request: NextRequest) {
  return new Response(null, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return new Response(null, { status: 405 });
}

export async function HEAD(request: NextRequest) {
  return new Response(null, { status: 405 });
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { 
    status: 200,
    headers: {
      'Allow': 'GET, POST'
    }
  });
}