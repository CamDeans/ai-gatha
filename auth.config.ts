import type { AuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/mongodb"

export const authConfig: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signin'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email as string
      }
      return session
    }
  },
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
            return null
          }

          const client = await clientPromise
          const user = await client
            .db("deansight")
            .collection("users")
            .findOne({ email: credentials.email })

          if (!user?.password) {
            return null
          }

          const isValid = await compare(
            credentials.password,
            user.password.toString()
          )

          if (!isValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ]
}