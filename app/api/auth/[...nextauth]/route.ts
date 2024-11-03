/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

// Create handler
const handler = NextAuth(authConfig);

// Export GET and POST handlers
export const GET = handler;
export const POST = handler;