'use client'

import { useState, useEffect } from 'react'
import { PromptEnhancer } from '@/lib/prompts/enhancer'
import type { EnhancementOptions } from '@/lib/prompts/enhancer'
import { Button } from '../ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AdvancedPromptControlsProps {
  basePrompt: string;
  onPromptUpdate: (prompt: string) => void;
}

export default function AdvancedPromptControls({
  basePrompt,
  onPromptUpdate
}: AdvancedPromptControlsProps) {
  const [options, setOptions] = useState<Partial<EnhancementOptions>>({})
  const [selectedDetails, setSelectedDetails] = useState<string[]>([])
  const [lastPrompt, setLastPrompt] = useState(basePrompt)

  // Reset state when base prompt changes
  useEffect(() => {
    if (basePrompt !== lastPrompt) {
      setOptions({})
      setSelectedDetails([])
      setLastPrompt(basePrompt)
    }
  }, [basePrompt, lastPrompt])

  // Update prompt when options change
  useEffect(() => {
    const enhancedPrompt = PromptEnhancer.enhancePrompt(basePrompt, {
      ...options,
      details: selectedDetails
    })
    onPromptUpdate(enhancedPrompt)
  }, [options, selectedDetails, basePrompt, onPromptUpdate])

  const handleOptionChange = (
    category: keyof Omit<EnhancementOptions, 'details'>,
    value: string | null
  ) => {
    setOptions(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const handleDetailToggle = (detail: string) => {
    setSelectedDetails(prev => {
      const isSelected = prev.includes(detail)
      if (isSelected) {
        return prev.filter(d => d !== detail)
      }
      return [...prev, detail]
    })
  }

  const getDisplayValue = (category: string, key: string | null) => {
    if (!key) return ''
    const map = {
      styles: PromptEnhancer.styles,
      qualities: PromptEnhancer.qualities,
      lighting: PromptEnhancer.lighting,
      perspectives: PromptEnhancer.perspectives,
      moods: PromptEnhancer.moods
    }
    return map[category as keyof typeof map][key as keyof typeof map[keyof typeof map]] || key
  }

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Style Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Style</label>
          <ScrollArea className="h-32 rounded-md border">
            <div className="p-2 space-y-1">
              {Object.entries(PromptEnhancer.styles).map(([key, value]) => (
                <Button
                  key={key}
                  variant={options.style === key ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleOptionChange('style', options.style === key ? null : key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Quality Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quality</label>
          <ScrollArea className="h-32 rounded-md border">
            <div className="p-2 space-y-1">
              {Object.entries(PromptEnhancer.qualities).map(([key, value]) => (
                <Button
                  key={key}
                  variant={options.quality === key ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleOptionChange('quality', options.quality === key ? null : key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Lighting Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Lighting</label>
          <ScrollArea className="h-32 rounded-md border">
            <div className="p-2 space-y-1">
              {Object.entries(PromptEnhancer.lighting).map(([key, value]) => (
                <Button
                  key={key}
                  variant={options.lighting === key ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleOptionChange('lighting', options.lighting === key ? null : key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Details Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Details</label>
          <ScrollArea className="h-32 rounded-md border">
            <div className="p-2 space-y-1">
              {PromptEnhancer.detailEnhancements.map((detail) => (
                <Button
                  key={detail}
                  variant={selectedDetails.includes(detail) ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleDetailToggle(detail)}
                >
                  {detail}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enhanced Prompt</label>
          <span className="text-xs text-muted-foreground">
            {Object.keys(options).length + selectedDetails.length} enhancement(s)
          </span>
        </div>
        <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
          {PromptEnhancer.enhancePrompt(basePrompt, { ...options, details: selectedDetails })}
        </div>
      </div>
    </div>
  );
} 