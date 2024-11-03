/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

// Helper function to create a proper request object
async function createAuthRequest(request: NextRequest) {
  const url = new URL(request.url);
  const nextauthParams = url.pathname
    .split('/')
    .filter(param => param !== '' && param !== 'api' && param !== 'auth');

  // Create a new request with minimal properties
  const authRequest = new Request(url, {
    method: request.method,
    headers: new Headers(request.headers),
    body: request.body
  });

  // Add nextauth params to request
  Object.defineProperty(authRequest, 'query', {
    get: () => ({
      nextauth: nextauthParams,
      ...Object.fromEntries(url.searchParams)
    }),
    enumerable: true,
    configurable: true
  });

  return authRequest;
}

// Export handlers with error handling
export async function GET(request: NextRequest) {
  try {
    const authRequest = await createAuthRequest(request);
    const response = await handler(authRequest);
    
    if (!response) {
      throw new Error('No response from auth handler');
    }
    
    return response;
  } catch (error) {
    console.error('NextAuth GET Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authRequest = await createAuthRequest(request);
    const response = await handler(authRequest);
    
    if (!response) {
      throw new Error('No response from auth handler');
    }
    
    return response;
  } catch (error) {
    console.error('NextAuth POST Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Export other methods with proper error handling
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function HEAD() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
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