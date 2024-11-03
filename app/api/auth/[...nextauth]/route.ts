/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

// Create and export handler directly
const handler = NextAuth(authConfig);

// Export GET and POST handlers
export { handler as GET, handler as POST };

// Export other methods
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;