'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Helper function to sanitize prompt before sending to API
function sanitizePrompt(prompt: string): string {
  // First, encode to handle any Unicode characters
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('ascii');
  
  // Convert to ASCII only
  const asciiOnly = decoder.decode(encoder.encode(prompt));
  
  return asciiOnly
    // Remove zero-width spaces and other invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove all non-printable characters
    .replace(/[^\x20-\x7E]/g, '')
    // Convert smart quotes to regular quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Keep only alphanumeric characters, basic punctuation, and spaces
    .replace(/[^a-zA-Z0-9\s.,!?'-]/g, '')
    // Trim whitespace
    .trim();
}

interface PromptInputProps {
  onSuccess?: () => void;
}

export function PromptInput({ onSuccess }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate image')
      }

      const data = await response.json()
      
      // Show success message
      toast.success('Image generated successfully!')
      
      // Clear the prompt
      setPrompt('')
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter your prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px]"
      />
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full"
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </Button>
    </div>
  )
} 