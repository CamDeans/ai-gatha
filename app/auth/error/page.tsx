'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // Log the error for debugging in production
    if (error) {
      console.error('Auth error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600">
          {error === 'CredentialsSignin' 
            ? 'Invalid email or password'
            : 'An error occurred during authentication'}
        </p>
      </div>
    </div>
  );
} 