/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest } from 'next/server';

async function auth(request: NextRequest) {
  // Create handler with config
  const handler = NextAuth(authConfig);
  
  // Return handler response
  return handler(request);
}

// Export all required HTTP methods
export const GET = auth;
export const POST = auth;
export const PUT = auth;
export const PATCH = auth;
export const DELETE = auth;
export const HEAD = auth;
export const OPTIONS = auth;