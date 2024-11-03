/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

// Helper function to create a proper request object
function createAuthRequest(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace('/api/auth/', '');
  
  return new Request(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
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
}

// Export handlers
export async function GET(request: NextRequest) {
  return handler(createAuthRequest(request));
}

export async function POST(request: NextRequest) {
  return handler(createAuthRequest(request));
}

// Export other methods
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;