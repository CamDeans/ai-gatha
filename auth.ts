import NextAuth from 'next-auth';
import { getServerSession } from 'next-auth';
import { authConfig } from './auth.config';

export const { signIn, signOut } = NextAuth(authConfig);

// This is a server-side function
export async function auth() {
  const session = await getServerSession(authConfig);
  return session;
} 