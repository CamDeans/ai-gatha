/**
 * Create NextAuth handler with configuration
 */
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const handler = NextAuth(authConfig)

/**
 * Export route handlers
 */
export const GET = async (req: Request, ctx: any) => {
  try {
    return await handler(req, ctx)
  } catch (error) {
    console.error('NextAuth GET Error:', error)
    throw error
  }
}

export const POST = async (req: Request, ctx: any) => {
  try {
    return await handler(req, ctx)
  } catch (error) {
    console.error('NextAuth POST Error:', error)
    throw error
  }
}