import type { AuthOptions, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/mongodb"

// Define the base user type
interface ExtendedUser extends User {
  id: string;
}

// Define the session user type that matches NextAuth's requirements
type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
} & {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Define the session type
type ExtendedSession = {
  user: SessionUser;
  expires: string;
}

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
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const client = await clientPromise;
          const db = client.db("deansight");
          
          const user = await db
            .collection("users")
            .findOne({ 
              email: credentials.email.toLowerCase()
            });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await compare(credentials.password, user.password);
          
          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null,
            image: null
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
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false // Disable debug in production
}