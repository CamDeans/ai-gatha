import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();
  
  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Otherwise redirect to sign in
  redirect('/auth/signin');
} 