'use client'

import { useState } from 'react'
import { ImageGenerationSettings, defaultSettings, stylePresets, schedulers } from '@/lib/ai-providers/settings'

interface GenerationSettingsProps {
  onSettingsChange: (settings: Partial<ImageGenerationSettings>) => void;
}

export default function GenerationSettings({ onSettingsChange }: GenerationSettingsProps) {
  const [settings, setSettings] = useState<Partial<ImageGenerationSettings>>(defaultSettings)

  const handleChange = (key: keyof ImageGenerationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <h3 className="font-medium">Generation Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Style Preset */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Style Preset</label>
          <select
            value={settings.style_preset || ''}
            onChange={(e) => handleChange('style_preset', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">None</option>
            {Object.entries(stylePresets).map(([key, value]) => (
              <option key={key} value={key}>
                {key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Scheduler */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scheduler</label>
          <select
            value={settings.scheduler}
            onChange={(e) => handleChange('scheduler', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            {schedulers.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Image Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Image Size</label>
          <select
            value={`${settings.width}x${settings.height}`}
            onChange={(e) => {
              const [width, height] = e.target.value.split('x').map(Number)
              handleChange('width', width)
              handleChange('height', height)
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="512x512">512 x 512</option>
            <option value="768x768">768 x 768</option>
            <option value="1024x1024">1024 x 1024</option>
          </select>
        </div>

        {/* Quality Settings */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quality (Steps)</label>
          <input
            type="range"
            min="20"
            max="50"
            value={settings.num_inference_steps}
            onChange={(e) => handleChange('num_inference_steps', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground text-center">
            {settings.num_inference_steps} steps
          </div>
        </div>

        {/* Guidance Scale */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Creativity</label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={settings.guidance_scale}
            onChange={(e) => handleChange('guidance_scale', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground text-center">
            {settings.guidance_scale} (Higher = More Stable)
          </div>
        </div>

        {/* Seed */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Seed</label>
          <input
            type="number"
            value={settings.seed || -1}
            onChange={(e) => handleChange('seed', parseInt(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            placeholder="Random"
          />
        </div>
      </div>
    </div>
  )
} 