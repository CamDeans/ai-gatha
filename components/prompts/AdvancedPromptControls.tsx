'use client'

import { useState, useEffect } from 'react'
import { PromptEnhancer } from '@/lib/prompts/enhancer'
import { PromptEngineer } from '@/lib/prompts/engineer'
import type { EnhancementOptions } from '@/lib/prompts/enhancer'
import { Button } from '../ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface AdvancedPromptControlsProps {
  basePrompt: string;
  onPromptUpdate: (prompt: string) => void;
}

export default function AdvancedPromptControls({
  basePrompt,
  onPromptUpdate,
}: AdvancedPromptControlsProps) {
  const [options, setOptions] = useState<EnhancementOptions>({})
  const [selectedDetails, setSelectedDetails] = useState<string[]>([])
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }>({ isValid: true, issues: [], suggestions: [] })

  // Validate prompt whenever it changes
  useEffect(() => {
    const result = PromptEngineer.validatePrompt(basePrompt)
    setValidationResult(result)
    
    // Show validation feedback
    if (result.issues.length > 0) {
      toast.error(result.issues[0])
    }
    if (result.suggestions.length > 0) {
      toast.info(result.suggestions[0])
    }
  }, [basePrompt])

  const handleStyleChange = (style: string) => {
    setOptions(prev => ({ ...prev, style }))
    updatePrompt({ ...options, style })
  }

  const handleQualityChange = (quality: string) => {
    setOptions(prev => ({ ...prev, quality }))
    updatePrompt({ ...options, quality })
  }

  const handleDetailToggle = (detail: string) => {
    const newDetails = selectedDetails.includes(detail)
      ? selectedDetails.filter(d => d !== detail)
      : [...selectedDetails, detail]
    
    setSelectedDetails(newDetails)
    updatePrompt({ ...options, details: newDetails })
  }

  const updatePrompt = (newOptions: EnhancementOptions) => {
    const enhancedPrompt = PromptEnhancer.enhancePrompt(basePrompt, newOptions)
    onPromptUpdate(enhancedPrompt)
  }

  return (
    <div className="space-y-6 p-4">
      {/* Validation Feedback */}
      {(validationResult.issues.length > 0 || validationResult.suggestions.length > 0) && (
        <div className="space-y-2">
          {validationResult.issues.map((issue, i) => (
            <div key={i} className="text-sm text-destructive">
              {issue}
            </div>
          ))}
          {validationResult.suggestions.map((suggestion, i) => (
            <div key={i} className="text-sm text-muted-foreground">
              Tip: {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Style Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Style</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PromptEnhancer.styles).map(([key, value]) => (
            <Button
              key={key}
              variant={options.style === key ? 'default' : 'outline'}
              onClick={() => handleStyleChange(key)}
              className="justify-start"
            >
              {key}
            </Button>
          ))}
        </div>
      </div>

      {/* Quality Settings */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quality</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PromptEnhancer.qualities).map(([key, value]) => (
            <Button
              key={key}
              variant={options.quality === key ? 'default' : 'outline'}
              onClick={() => handleQualityChange(key)}
              className="justify-start"
            >
              {key}
            </Button>
          ))}
        </div>
      </div>

      {/* Detail Enhancements */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Additional Details</label>
        <ScrollArea className="h-[200px] rounded-md border p-2">
          <div className="grid grid-cols-2 gap-2">
            {PromptEnhancer.details.map((detail: string) => (
              <Button
                key={detail}
                variant={selectedDetails.includes(detail) ? 'default' : 'outline'}
                onClick={() => handleDetailToggle(detail)}
                className="justify-start"
                size="sm"
              >
                {detail}
              </Button>
            ))}
          </div>
        </ScrollArea>
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
  )
} 