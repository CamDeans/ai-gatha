/**
 * Root layout component for the Deansight AI application
 * Handles global providers, authentication, and theme management
 */
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from 'sonner'
import AuthProvider from '@/components/auth/AuthProvider'
import '@/styles/globals.css'

// Initialize Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <AuthProvider session={null}>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 