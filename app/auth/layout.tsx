/**
 * Authentication layout component
 * Provides consistent layout for auth-related pages
 */
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import { metadata, viewport } from './metadata';

export { metadata, viewport }

/**
 * Layout wrapper for authentication pages
 * Handles session checking and redirects
 */
export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">AI|Gatha</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered image generation platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 