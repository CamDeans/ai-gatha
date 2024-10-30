/**
 * PromptInput component for image generation
 * Handles user input and API calls for image generation
 */
'use client'

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PromptModal from '../prompts/PromptModal';
import PromptRefinementModal from '../prompts/PromptRefinementModal';
import { SparkleIcon } from '../icons/SparkleIcon';
import { WandIcon } from '../icons/WandIcon';
import AdvancedPromptControls from '../prompts/AdvancedPromptControls';
import ImageDisplay from './ImageDisplay';

interface PromptInputProps {
  onImageGenerated: (imageUrl: string) => void;
}

export default function PromptInput({ onImageGenerated }: PromptInputProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isRefinementModalOpen, setIsRefinementModalOpen] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  /**
   * Handles form submission and image generation
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${window.location.origin}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
        credentials: 'same-origin',
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setPrompt('');
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] space-y-4">
      <div className="flex-none space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Enter your prompt
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPromptModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-md hover:bg-primary/10"
              title="Get AI suggestions"
            >
              <SparkleIcon className="h-4 w-4" />
              <span>Suggestions</span>
            </button>
            {prompt.trim() && (
              <button
                type="button"
                onClick={() => setIsRefinementModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors rounded-md hover:bg-secondary/10"
                title="Enhance your prompt"
              >
                <WandIcon className="h-4 w-4" />
                <span>Enhance</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="w-full min-h-[100px] max-h-[150px] p-4 rounded-lg border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          disabled={isLoading}
        />

        {prompt.trim() && (
          <button
            type="button"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {showAdvancedControls ? 'Hide' : 'Show'} Advanced Controls
          </button>
        )}

        {showAdvancedControls && prompt.trim() && (
          <AdvancedPromptControls
            basePrompt={prompt}
            onPromptUpdate={setPrompt}
          />
        )}
      </div>

      <div className="flex-1 min-h-0 relative overflow-hidden rounded-lg">
        {generatedImage && (
          <ImageDisplay imageUrl={generatedImage} />
        )}
      </div>

      <div className="flex-none">
        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          className="w-full btn-primary h-12 relative overflow-hidden group"
        >
          <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}>
            <SparkleIcon className="h-5 w-5" />
            Generate Image
          </span>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </button>
      </div>

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
  );
} 