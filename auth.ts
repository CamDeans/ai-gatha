import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import { authConfig } from "./auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide process.env.NEXTAUTH_SECRET");
}

export const authOptions = {
  ...authConfig,
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
const handler = NextAuth(authOptions);
export const { signIn, signOut } = handler; 