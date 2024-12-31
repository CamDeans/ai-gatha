import type { DefaultSession, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { AuthOptions } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
    } & DefaultSession['user'];
  }
}

export const authConfig: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user, account, trigger }) => {
      if (trigger === 'signIn' && account && token.email) {
        try {
          const response = await fetch('http://localhost:3000/api/user', {
            headers: {
              'x-user-email': token.email
            }
          });

          if (response.ok) {
            const userData = await response.json();
            token.id = userData.userId;
            token.email = userData.email;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    redirect: ({ url, baseUrl }) => {
      if (url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      else if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
};