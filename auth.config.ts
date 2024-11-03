import type { AuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { ApiError } from "@/lib/api-error"

interface AuthError {
  message: string;
  statusCode: number;
}

export const authConfig: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new ApiError('Missing credentials', 400);
          }

          const client = await clientPromise;
          const db = client.db("deansight");
          
          const user = await db
            .collection("users")
            .findOne({ 
              email: credentials.email.toLowerCase()
            });

          if (!user) {
            throw new ApiError('Invalid credentials', 401);
          }

          const isValid = await compare(credentials.password, user.password);
          
          if (!isValid) {
            throw new ApiError('Invalid credentials', 401);
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null
          }
        } catch (error) {
          console.error('Auth error:', error);
          if (error instanceof ApiError) {
            throw new Error(JSON.stringify({
              message: error.message,
              statusCode: error.statusCode
            } as AuthError));
          }
          throw new Error(JSON.stringify({
            message: 'Authentication failed',
            statusCode: 500
          } as AuthError));
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signin'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development'
}