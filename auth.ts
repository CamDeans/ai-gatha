import NextAuth, { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { authConfig } from "./auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions: AuthOptions = {
  ...authConfig,
  providers: [...authConfig.providers],
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'aigatha',
    collections: {
      Users: 'users',
      Accounts: 'accounts',
      Sessions: 'sessions',
      VerificationTokens: 'verification_tokens',
    },
  }),
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);
export const { signIn, signOut } = NextAuth(authOptions); 