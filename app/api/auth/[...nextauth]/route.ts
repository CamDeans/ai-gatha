/**
 * Create NextAuth handler with configuration
 */
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const handler = NextAuth(authConfig)

/**
 * Export route handlers
 */
export const GET = handler
export const POST = handler