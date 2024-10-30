'use client'

import { useState, useEffect } from 'react'
import { PromptEngineer } from '@/lib/prompts/engineer'
import { SparkleIcon } from '../icons/SparkleIcon'

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export default function PromptModal({ isOpen, onClose, onSelectPrompt }: PromptModalProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<ReturnType<typeof PromptEngineer.generatePromptSuggestions>>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInput('')
      setSuggestions([])
      setIsGenerating(false)
    }
  }, [isOpen])

  const handleGenerate = async () => {
    if (!input.trim()) return
    
    setIsGenerating(true)
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      const newSuggestions = PromptEngineer.generatePromptSuggestions(input)
      setSuggestions(newSuggestions)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-card w-full max-w-2xl rounded-xl shadow-lg border animate-in fade-in-0 zoom-in-95">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <SparkleIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">AI Prompt Engineer</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Describe what you want to create
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                placeholder="e.g., modern business logo"
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Press Enter or click Generate to get AI suggestions
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparkleIcon className="mr-2 h-4 w-4" />
                  Generate Suggestions
                </>
              )}
            </button>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Suggested Prompts:</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSelectPrompt(suggestion.prompt)
                        onClose()
                      }}
                      className="w-full text-left p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors space-y-1"
                    >
                      <div className="font-medium">{suggestion.prompt}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{suggestion.template.category}</span>
                        <span>•</span>
                        <span className="text-primary">{Math.round(suggestion.confidence * 100)}% match</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-6 pt-0">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 