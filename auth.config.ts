import type { DefaultSession } from "next-auth";
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

interface AuthorizedCallback {
  auth: { user?: { id: string } };
  request: { nextUrl: URL };
}

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: AuthorizedCallback) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnGallery = nextUrl.pathname.startsWith('/gallery');
      const isOnSettings = nextUrl.pathname.startsWith('/settings');
      
      if (isOnDashboard || isOnGallery || isOnSettings) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
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