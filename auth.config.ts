import type { AuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/mongodb"

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
            throw new Error('Missing credentials')
          }

          const client = await clientPromise;
          const db = client.db("deansight");
          
          const user = await db
            .collection("users")
            .findOne({ 
              email: credentials.email.toLowerCase()
            });

          if (!user) {
            throw new Error('No user found')
          }

          const isValid = await compare(credentials.password, user.password);
          
          if (!isValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null
          }
        } catch (error) {
          console.error('Auth error:', error);
          throw error; // This will be caught by NextAuth
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