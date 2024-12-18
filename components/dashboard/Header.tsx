'use client'

import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50">
      <div className="flex items-center justify-between h-full px-6 mx-auto">
        <Link href="/dashboard" className="text-primary font-bold text-lg">
          AI|Gatha
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="text-sm hover:text-destructive"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 