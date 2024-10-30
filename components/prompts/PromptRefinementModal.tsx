'use client'

import { useState, useEffect } from 'react'
import { PromptRefiner } from '@/lib/prompts/refiner'
import { SparkleIcon } from '../icons/SparkleIcon'

interface PromptRefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSelectRefinement: (prompt: string) => void;
}

export default function PromptRefinementModal({
  isOpen,
  onClose,
  currentPrompt,
  onSelectRefinement
}: PromptRefinementModalProps) {
  const [suggestions, setSuggestions] = useState<ReturnType<typeof PromptRefiner.refinePrompt>>([])

  useEffect(() => {
    if (isOpen && currentPrompt) {
      setSuggestions(PromptRefiner.refinePrompt(currentPrompt))
    }
  }, [isOpen, currentPrompt])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-card w-full max-w-2xl rounded-xl shadow-lg border animate-in fade-in-0 zoom-in-95">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <SparkleIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Enhance Your Prompt</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Current prompt: <span className="font-medium text-foreground">{currentPrompt}</span>
          </p>
          
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">{suggestion.type}:</span>
                  <span className="text-sm text-muted-foreground">{suggestion.suggestion}</span>
                </div>
                <button
                  onClick={() => {
                    onSelectRefinement(suggestion.example)
                    onClose()
                  }}
                  className="w-full text-left p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                >
                  <span className="text-sm font-medium">{suggestion.example}</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 