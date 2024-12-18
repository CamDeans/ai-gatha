/**
 * NextAuth middleware configuration
 * Protects routes that require authentication
 */
import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add security headers
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
      signOut: '/auth/signin',
    }
  }
);

/**
 * Configure which routes are protected by authentication
 * Any route matching these patterns will require authentication
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/generate',
    '/api/gallery/:path*',
    '/api/user/:path*',
    // Protected pages but allow API routes
    '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
  ]
} 

/**
 * CORS middleware configuration
 * Adds CORS headers to API routes
 */
export function corsMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

/**
 * Configure which routes are protected by CORS
 * Any route matching these patterns will require CORS headers
 */
export const corsConfig = {
  matcher: '/api/:path*',
}; 