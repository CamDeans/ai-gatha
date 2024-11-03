import type { AuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/mongodb"

export const authConfig: AuthOptions = {
  providers: [
    Credentials({
      id: 'credentials',
      name: "Credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "example@email.com"
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "Your password"
        }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const client = await clientPromise;
          if (!client) {
            console.error('Failed to connect to MongoDB');
            return null;
          }

          const db = client.db("deansight");
          
          const user = await db
            .collection("users")
            .findOne({ 
              email: credentials.email.toLowerCase()
            });

          if (!user || !user.password) {
            console.log('User not found or missing password');
            return null;
          }

          const isValid = await compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email);
    },
    async signOut({ token }) {
      console.log('User signed out:', token.email);
    }
  }
}