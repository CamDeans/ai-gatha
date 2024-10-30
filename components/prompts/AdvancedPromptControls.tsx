'use client'

import { useState, useEffect } from 'react'
import { PromptEnhancer } from '@/lib/prompts/enhancer'
import type { EnhancementOptions } from '@/lib/prompts/enhancer'

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

  const handleOptionChange = (
    category: keyof Omit<EnhancementOptions, 'details'>,
    value: string | null
  ) => {
    const newOptions = { ...options }
    
    if (value === null || value === '') {
      delete newOptions[category]
    } else {
      newOptions[category] = value
    }
    
    setOptions(newOptions)
    updatePrompt(newOptions, selectedDetails)
  }

  const handleDetailToggle = (detail: string) => {
    const newDetails = selectedDetails.includes(detail)
      ? selectedDetails.filter(d => d !== detail)
      : [...selectedDetails, detail]
    
    setSelectedDetails(newDetails)
    updatePrompt(options, newDetails)
  }

  const updatePrompt = (
    newOptions: Partial<EnhancementOptions>,
    details: string[]
  ) => {
    const enhancedPrompt = PromptEnhancer.enhancePrompt(basePrompt, {
      ...newOptions,
      details
    })
    onPromptUpdate(enhancedPrompt)
  }

  const getDisplayValue = (category: keyof typeof PromptEnhancer, value: string) => {
    const mapping = PromptEnhancer[category] as Record<string, string>
    return mapping[value] || value
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Advanced Controls</h3>
        {(Object.keys(options).length > 0 || selectedDetails.length > 0) && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setOptions({})
                setSelectedDetails([])
                onPromptUpdate(basePrompt)
              }}
              className="text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Selected Options Summary */}
      {(Object.keys(options).length > 0 || selectedDetails.length > 0) && (
        <div className="bg-muted/50 p-2 rounded-md space-y-1">
          <p className="text-sm font-medium">Selected Enhancements:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(options).map(([key, value]) => (
              value && (
                <span key={key} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {key}: {value}
                </span>
              )
            ))}
            {selectedDetails.map((detail) => (
              <span key={detail} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {detail}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Style Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Style</label>
          {options.style && (
            <span className="text-xs text-primary font-medium">
              Selected: {getDisplayValue('styles', options.style)}
            </span>
          )}
        </div>
        <select
          value={options.style || ''}
          onChange={(e) => handleOptionChange('style', e.target.value || null)}
          className={`w-full rounded-md border ${
            options.style ? 'border-primary bg-primary/5' : 'border-input'
          } bg-background px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary`}
        >
          <option value="">Select a style</option>
          {Object.keys(PromptEnhancer.styles).map((key) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground italic">
          Example: "A portrait, {options.style || 'hyperrealistic'} style"
        </p>
      </div>

      {/* Quality Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Quality</label>
          {options.quality && (
            <span className="text-xs text-primary font-medium">
              Selected: {getDisplayValue('qualities', options.quality)}
            </span>
          )}
        </div>
        <select
          value={options.quality || ''}
          onChange={(e) => handleOptionChange('quality', e.target.value || null)}
          className={`w-full rounded-md border ${
            options.quality ? 'border-primary bg-primary/5' : 'border-input'
          } bg-background px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary`}
        >
          <option value="">Select quality</option>
          {Object.keys(PromptEnhancer.qualities).map((key) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground italic">
          Example: "A landscape, {options.quality || 'ultra high quality'}, masterpiece"
        </p>
      </div>

      {/* Lighting Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Lighting</label>
          {options.lighting && (
            <span className="text-xs text-primary font-medium">
              Selected: {getDisplayValue('lighting', options.lighting)}
            </span>
          )}
        </div>
        <select
          value={options.lighting || ''}
          onChange={(e) => handleOptionChange('lighting', e.target.value || null)}
          className={`w-full rounded-md border ${
            options.lighting ? 'border-primary bg-primary/5' : 'border-input'
          } bg-background px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary`}
        >
          <option value="">Select lighting</option>
          {Object.keys(PromptEnhancer.lighting).map((key) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground italic">
          Example: "A scene with {options.lighting || 'professional studio lighting'}, perfect exposure"
        </p>
      </div>

      {/* Perspective Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Perspective</label>
          {options.perspective && (
            <span className="text-xs text-primary font-medium">
              Selected: {getDisplayValue('perspectives', options.perspective)}
            </span>
          )}
        </div>
        <select
          value={options.perspective || ''}
          onChange={(e) => handleOptionChange('perspective', e.target.value || null)}
          className={`w-full rounded-md border ${
            options.perspective ? 'border-primary bg-primary/5' : 'border-input'
          } bg-background px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary`}
        >
          <option value="">Select perspective</option>
          {Object.keys(PromptEnhancer.perspectives).map((key) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground italic">
          Example: "A subject from a {options.perspective || 'close-up'} perspective, highly detailed"
        </p>
      </div>

      {/* Mood Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Mood</label>
          {options.mood && (
            <span className="text-xs text-primary font-medium">
              Selected: {getDisplayValue('moods', options.mood)}
            </span>
          )}
        </div>
        <select
          value={options.mood || ''}
          onChange={(e) => handleOptionChange('mood', e.target.value || null)}
          className={`w-full rounded-md border ${
            options.mood ? 'border-primary bg-primary/5' : 'border-input'
          } bg-background px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary`}
        >
          <option value="">Select mood</option>
          {Object.keys(PromptEnhancer.moods).map((key) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground italic">
          Example: "A scene with a {options.mood || 'dramatic'} atmosphere"
        </p>
      </div>

      {/* Detail Enhancements */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Additional Details</label>
          {selectedDetails.length > 0 && (
            <span className="text-xs text-primary font-medium">
              {selectedDetails.length} selected
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PromptEnhancer.detailEnhancements.map((detail) => {
            const isSelected = selectedDetails.includes(detail);
            return (
              <label
                key={detail}
                className={`flex items-center space-x-2 text-sm cursor-pointer p-2 rounded-md transition-all ${
                  isSelected 
                    ? 'bg-primary/10 text-primary ring-2 ring-primary/20' 
                    : 'hover:bg-accent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleDetailToggle(detail)}
                  className={`rounded border-2 ${
                    isSelected 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-input'
                  }`}
                />
                <span className={isSelected ? 'font-medium' : ''}>
                  {detail}
                </span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground italic">
          Example: "A subject with {selectedDetails.length > 0 ? selectedDetails.join(', ') : 'ultra detailed skin texture, sharp focus, 8k uhd'}"
        </p>
      </div>

      {/* Complete Prompt Example */}
      <div className="mt-6 p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Complete Prompt Structure:</p>
        <p className="text-xs text-muted-foreground">
          "A [subject], {options.style ? getDisplayValue('styles', options.style) : 'hyperrealistic'}, 
          {options.quality ? getDisplayValue('qualities', options.quality) : 'ultra high quality'}, 
          {options.lighting ? getDisplayValue('lighting', options.lighting) : 'professional lighting'}, 
          {options.perspective ? getDisplayValue('perspectives', options.perspective) : 'close-up'}, 
          {options.mood ? getDisplayValue('moods', options.mood) : 'dramatic'}, 
          {selectedDetails.length > 0 ? selectedDetails.join(', ') : 'highly detailed, sharp focus'}"
        </p>
      </div>

      {/* Enhanced Prompt Preview */}
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