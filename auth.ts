import { getServerSession } from "next-auth"
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import { authConfig } from "./auth.config"

export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
  return getServerSession(...args, authConfig)
} 