/**
 * Create NextAuth handler with configuration
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';

// Create handler
const handler = NextAuth(authConfig);

// Helper function to get nextauth params from URL
function getNextAuthParams(url: string) {
  const segments = url.split('/');
  const nextauthIndex = segments.indexOf('auth') + 1;
  return segments.slice(nextauthIndex);
}

// Helper function to create response
function createErrorResponse(error: any) {
  console.error('NextAuth Error:', error);
  return NextResponse.json(
    { error: 'Authentication failed' },
    { status: 500 }
  );
}

// Export handlers
export async function GET(request: NextRequest) {
  try {
    const nextauthParams = getNextAuthParams(request.url);
    const searchParams = new URL(request.url).searchParams;

    // Create a new request with minimal properties
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: new Headers({
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers)
      })
    });

    // Add query property
    Object.defineProperty(newRequest, 'query', {
      value: {
        nextauth: nextauthParams,
        ...Object.fromEntries(searchParams.entries())
      },
      writable: false
    });

    const response = await handler(newRequest);
    if (!response) {
      return createErrorResponse(new Error('No response from auth handler'));
    }

    return response;
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const nextauthParams = getNextAuthParams(request.url);
    const searchParams = new URL(request.url).searchParams;

    // Create a new request with minimal properties
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: new Headers({
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers)
      }),
      body: request.body
    });

    // Add query property
    Object.defineProperty(newRequest, 'query', {
      value: {
        nextauth: nextauthParams,
        ...Object.fromEntries(searchParams.entries())
      },
      writable: false
    });

    const response = await handler(newRequest);
    if (!response) {
      return createErrorResponse(new Error('No response from auth handler'));
    }

    return response;
  } catch (error) {
    return createErrorResponse(error);
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
  return NextResponse.json(
    { message: 'OK' },
    { 
      status: 200,
      headers: {
        'Allow': 'GET, POST'
      }
    }
  );
}