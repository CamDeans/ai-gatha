'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await signIn('credentials', {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        redirect: false,
        callbackUrl: '/dashboard'
      });

      if (response?.error) {
        setError('Invalid email or password');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid email or password"
        });
        return;
      }

      if (response?.ok) {
        toast({
          title: "Success",
          description: "Signed in successfully"
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again."
      });
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
      {searchParams?.get('error') && (
        <div className="bg-destructive/10 text-destructive p-3 rounded">
          {searchParams.get('error')}
        </div>
      )}
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          autoComplete="email"
          className="w-full p-2 border rounded bg-background"
        />
      </div>
      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoComplete="current-password"
          className="w-full p-2 border rounded bg-background"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
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