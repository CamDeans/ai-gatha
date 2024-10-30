/**
 * Dashboard page component
 * Main interface for image generation and display
 */
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import ImageDisplay from '@/components/dashboard/ImageDisplay'
import PromptInput from '@/components/dashboard/PromptInput'
import PromptModal from '@/components/prompts/PromptModal'
import PromptRefinementModal from '@/components/prompts/PromptRefinementModal'
import AdvancedPromptControls from '@/components/prompts/AdvancedPromptControls'

export default function Dashboard() {
  const { data: session } = useSession()
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false)
  const [isRefinementModalOpen, setIsRefinementModalOpen] = useState(false)
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)

  return (
    <div className="space-y-8">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Image Generation</h1>

          <div className="space-y-4">
            <PromptInput 
              onImageGenerated={setGeneratedImage}
              onPromptChange={setPrompt}
              onRefinementClick={() => setIsRefinementModalOpen(true)}
              onSuggestionsClick={() => setIsPromptModalOpen(true)}
              onAdvancedClick={() => setShowAdvancedControls(!showAdvancedControls)}
              showAdvanced={showAdvancedControls}
            />

            {showAdvancedControls && (
              <AdvancedPromptControls
                basePrompt={prompt}
                onPromptUpdate={setPrompt}
              />
            )}
          </div>
        </div>
      </div>
      
      {generatedImage && (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <ImageDisplay imageUrl={generatedImage} />
          </div>
        </div>
      )}

      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSelectPrompt={setPrompt}
      />

      <PromptRefinementModal
        isOpen={isRefinementModalOpen}
        onClose={() => setIsRefinementModalOpen(false)}
        currentPrompt={prompt}
        onSelectRefinement={setPrompt}
      />
    </div>
  )
} 