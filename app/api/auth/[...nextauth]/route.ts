/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest } from 'next/server';

// Create a single handler instance
const handler = NextAuth(authConfig);

// Export GET and POST with proper request handling
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const nextauthUrl = url.pathname.replace('/api/auth/', '');
  
  return handler(
    new Request(new URL(nextauthUrl, request.url), {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  );
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const nextauthUrl = url.pathname.replace('/api/auth/', '');
  
  return handler(
    new Request(new URL(nextauthUrl, request.url), {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  );
}

// Export all required HTTP methods
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;