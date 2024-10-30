/**
 * Settings page component
 * Allows users to manage their preferences and account settings
 */
'use client'

import { useSession } from 'next-auth/react'
import Sidebar from '@/components/dashboard/Sidebar'
import { useState } from 'react'

export default function Settings() {
  const { data: session } = useSession()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement settings save functionality
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${
                  isDarkMode ? 'bg-amazon-blue' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
              >
                <span
                  className={`${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
} 