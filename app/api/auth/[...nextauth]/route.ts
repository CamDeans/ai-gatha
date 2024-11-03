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

// Helper function to create request with query
function createAuthRequest(request: NextRequest) {
  const nextauthParams = getNextAuthParams(request.url);
  const searchParams = new URL(request.url).searchParams;

  // Create a new request with the same properties
  const newRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    mode: request.mode,
    redirect: request.redirect,
  });

  // Add query property
  Object.defineProperty(newRequest, 'query', {
    get: () => ({
      nextauth: nextauthParams,
      ...Object.fromEntries(searchParams.entries())
    }),
    enumerable: true,
    configurable: true
  });

  return newRequest;
}

// Export handlers
export async function GET(request: NextRequest) {
  const authRequest = createAuthRequest(request);
  return handler(authRequest);
}

export async function POST(request: NextRequest) {
  const authRequest = createAuthRequest(request);
  return handler(authRequest);
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