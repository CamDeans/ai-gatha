'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type ImageSize = '512x512' | '768x768' | '1024x1024'
type ModelType = 'stable-diffusion' | 'dall-e' | 'midjourney'

interface UserSettings {
  userId: string;
  imageSize: ImageSize;
  defaultModel: ModelType;
  promptHistory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<UserSettings>({
    userId: '',
    imageSize: '512x512',
    defaultModel: 'stable-diffusion',
    promptHistory: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      setSettings({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          updatedAt: new Date()
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save settings')
      }

      const data = await response.json()
      setSettings(prev => ({
        ...prev,
        ...data.settings
      }))
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingChange = (key: keyof UserSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
      updatedAt: new Date()
    }))
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      Loading settings...
    </div>
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Image Generation */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Image Generation</h2>
            
            <div className="space-y-2">
              <Label htmlFor="imageSize">Default Image Size</Label>
              <Select
                value={settings.imageSize}
                onValueChange={(value: ImageSize) => 
                  handleSettingChange('imageSize', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select image size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="512x512">512x512</SelectItem>
                  <SelectItem value="768x768">768x768</SelectItem>
                  <SelectItem value="1024x1024">1024x1024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultModel">Default Model</Label>
              <Select
                value={settings.defaultModel}
                onValueChange={(value: ModelType) => 
                  handleSettingChange('defaultModel', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
                  <SelectItem value="dall-e">DALL-E</SelectItem>
                  <SelectItem value="midjourney">Midjourney</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Preferences</h2>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prompt History</Label>
                <p className="text-sm text-muted-foreground">
                  Save your prompt history for future reference
                </p>
              </div>
              <Switch
                checked={settings.promptHistory}
                onCheckedChange={(checked: boolean) => 
                  handleSettingChange('promptHistory', checked)
                }
              />
            </div>
          </div>
        </div>

        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-primary text-primary-foreground shadow hover:bg-primary/90"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
} 