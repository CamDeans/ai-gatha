'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error || 'An error occurred';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {error}
          </p>
          <Button asChild>
            <Link href="/auth/signin">
              Try Again
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add static rendering configuration
export const dynamic = 'force-static'; 