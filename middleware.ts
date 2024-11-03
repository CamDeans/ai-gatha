/**
 * NextAuth middleware configuration
 * Protects routes that require authentication
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth/')

  if (isApiRoute && !token && !isAuthRoute) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

/**
 * Configure which routes are protected by authentication
 * Any route matching these patterns will require authentication
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/generate',
    '/auth/:path*'
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