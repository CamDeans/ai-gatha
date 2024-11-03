/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

// Helper function to create a proper request object
function createAuthRequest(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace('/api/auth/', '');
  
  return new Request(url, {
    method: request.method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...Object.fromEntries(request.headers)
    }),
    body: request.body,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    mode: request.mode,
    redirect: request.redirect,
  });
}

// Export handlers
export async function GET(request: NextRequest) {
  try {
    const authRequest = createAuthRequest(request);
    const response = await handler(authRequest);
    
    // If response is undefined or null, return a 500 error
    if (!response) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // If response doesn't have a status, assume it's a 200
    if (!response.status) {
      const newResponse = new Response(response.body, {
        status: 200,
        headers: response.headers
      });
      return newResponse;
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
    const authRequest = createAuthRequest(request);
    const response = await handler(authRequest);
    
    // If response is undefined or null, return a 500 error
    if (!response) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // If response doesn't have a status, assume it's a 200
    if (!response.status) {
      const newResponse = new Response(response.body, {
        status: 200,
        headers: response.headers
      });
      return newResponse;
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