/**
 * Theme provider component for the application
 * Handles dark/light mode theme switching
 */
'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      themes={['light', 'dark', 'system']}
      storageKey="deansight-theme"
    >
      <Toaster 
        richColors 
        position="top-center"
        theme="dark"
        closeButton
      />
      {children}
    </ThemeProvider>
  )
} 