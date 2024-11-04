'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await signIn('credentials', {
        email: (formData.get('email') as string).toLowerCase(),
        password: formData.get('password') as string,
        redirect: false,
      });

      if (!response) {
        throw new Error('Authentication failed');
      }

      if (response.error) {
        setError('Invalid email or password');
        return;
      }

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded">
          {error}
        </div>
      )}
      {searchParams?.get('registered') && (
        <div className="bg-green-50 text-green-500 p-3 rounded">
          Account created successfully. Please sign in.
        </div>
      )}
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full p-2 border rounded bg-background"
        />
      </div>
      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full p-2 border rounded bg-background"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        variant="default"
        className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
} 