import type { AuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import connectToDatabase from "@/lib/mongodb"

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
            console.log('Missing credentials');
            return null;
          }

          let client;
          try {
            client = await connectToDatabase();
          } catch (error) {
            console.error('MongoDB connection error:', error);
            throw new Error('Database connection failed');
          }

          const db = client.db('deansight');
          const users = db.collection("users");
          
          const user = await users.findOne({ 
            email: credentials.email.toLowerCase() 
          });

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          const isValid = await compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error; // Let NextAuth handle the error
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
hbk3ij;o  debug: process.env.NODE_ENV === 'production'
}
