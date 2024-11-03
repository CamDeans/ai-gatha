/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

// Helper function to parse nextauth from URL
function getNextAuthParams(url: string) {
  const params = new URL(url).pathname
    .split('/')
    .filter(param => param !== '' && param !== 'api' && param !== 'auth');
  return params;
}

// Export handlers
export async function GET(request: NextRequest) {
  const nextauthParams = getNextAuthParams(request.url);
  const authRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // Add nextauth params to request
  Object.defineProperty(authRequest, 'query', {
    get: () => ({
      nextauth: nextauthParams,
      ...Object.fromEntries(new URL(request.url).searchParams)
    }),
    enumerable: true
  });

  return handler(authRequest);
}

export async function POST(request: NextRequest) {
  const nextauthParams = getNextAuthParams(request.url);
  const authRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // Add nextauth params to request
  Object.defineProperty(authRequest, 'query', {
    get: () => ({
      nextauth: nextauthParams,
      ...Object.fromEntries(new URL(request.url).searchParams)
    }),
    enumerable: true
  });

  return handler(authRequest);
}

// Export other methods as direct handler calls
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;