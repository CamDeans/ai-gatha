/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

// Create a single handler instance
const handler = NextAuth(authConfig);

// Export the handler directly for both GET and POST
export { handler as GET, handler as POST };