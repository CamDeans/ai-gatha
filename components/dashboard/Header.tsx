'use client'

import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show header if user is logged in
  if (!session?.user) return null;

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-6 z-50">
        <div className="animate-pulse h-6 w-32 bg-muted rounded" />
        <div className="animate-pulse h-6 w-24 bg-muted rounded" />
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-6 z-50">
      <div className="flex items-center space-x-4">
        <span className="text-primary font-bold text-lg">AI|Gatha</span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5 text-foreground" />
          ) : (
            <MoonIcon className="h-5 w-5 text-foreground" />
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
    </header>
  );
} 