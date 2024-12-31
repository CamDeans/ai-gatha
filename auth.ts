import NextAuth from 'next-auth';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { authConfig } from '@/auth.config';

export const authOptions = {
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'aigatha',
    collections: {
      Users: 'users',
      Accounts: 'accounts',
      Sessions: 'sessions',
      VerificationTokens: 'verification_tokens',
    },
  }),
};

export const { auth, signIn, signOut } = NextAuth(authOptions); 