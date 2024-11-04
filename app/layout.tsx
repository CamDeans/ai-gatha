/**
 * Root layout component for the Deansight AI application
 * Handles global providers, authentication, and theme management
 */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

// Initialize Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'AI Gatha',
  description: 'AI Image Generation Platform',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
} 