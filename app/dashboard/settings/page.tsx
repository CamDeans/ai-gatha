'use client'

import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface UserSettings {
  theme: string;
  imageSize: string;
  defaultStyle: string;
  notifications: boolean;
  autoSave: boolean;
  promptHistory: boolean;
  imageQuality: string;
  defaultScheduler: string;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  imageSize: '512x512',
  defaultStyle: 'photorealistic',
  notifications: true,
  autoSave: true,
  promptHistory: true,
  imageQuality: 'high',
  defaultScheduler: 'DPMSolverMultistep'
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) {
          throw new Error('Failed to load settings')
        }
        const data = await response.json()
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }))
          if (data.theme) {
            setTheme(data.theme)
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      loadSettings()
    }
  }, [session, setTheme])

  const handleSettingChange = async (key: keyof UserSettings, value: any) => {
    try {
      setIsSaving(true)
      const newSettings = { ...settings, [key]: value }
      
      // Update local state immediately for responsive UI
      setSettings(newSettings)
      if (key === 'theme') {
        setTheme(value)
      }

      // Save to database
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
      
      // Revert changes on error
      setSettings(settings)
      if (key === 'theme') {
        setTheme(settings.theme)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleThemeChange = async (value: string) => {
    try {
      setIsSaving(true)
      const newSettings = { ...settings, theme: value }
      
      // Update theme immediately for better UX
      setTheme(value)
      setSettings(newSettings)

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        throw new Error('Failed to save theme setting')
      }

      toast.success('Theme updated successfully')
    } catch (error) {
      console.error('Error saving theme:', error)
      toast.error('Failed to save theme')
      
      // Revert on error
      setTheme(settings.theme)
      setSettings(settings)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        {isSaving && (
          <span className="text-sm text-muted-foreground">Saving...</span>
        )}
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Customize how Deansight AI looks on your device
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </section>

        {/* Image Generation Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Image Generation</h2>
            <p className="text-sm text-muted-foreground">
              Configure default settings for image generation
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Image Size</label>
              <select
                value={settings.imageSize}
                onChange={(e) => handleSettingChange('imageSize', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="256x256">Small (256x256)</option>
                <option value="512x512">Medium (512x512)</option>
                <option value="1024x1024">Large (1024x1024)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default Style</label>
              <select
                value={settings.defaultStyle}
                onChange={(e) => handleSettingChange('defaultStyle', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="photorealistic">Photorealistic</option>
                <option value="artistic">Artistic</option>
                <option value="cinematic">Cinematic</option>
                <option value="minimalist">Minimalist</option>
              </select>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Customize your experience
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-save Images</p>
                <p className="text-sm text-muted-foreground">
                  Automatically save generated images to your gallery
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Prompt History</p>
                <p className="text-sm text-muted-foreground">
                  Save your prompt history for future use
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promptHistory}
                  onChange={(e) => handleSettingChange('promptHistory', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates and notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 