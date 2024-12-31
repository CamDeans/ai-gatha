import type { DefaultSession, AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
] as const;

export const authConfig = {
  providers,
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: { id: string } }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { session: DefaultSession; token: JWT & { id: string } }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
} as const;