/**
 * Root layout component for the Deansight AI application
 * Handles global providers, authentication, and theme management
 */
import './globals.css'
import { Inter } from 'next/font/google'
import { auth } from '@/auth'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI-Gatha',
  description: 'AI Image Generation Application',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
} 