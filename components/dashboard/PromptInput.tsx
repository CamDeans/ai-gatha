'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';
import { Card } from '@/components/ui/card';
import { PromptEngineer } from '@/lib/prompts/engineer';
import { PromptRefiner } from '@/lib/prompts/refiner';

interface PromptInputProps {
  onSubmit?: (prompt: string) => void;
  onError?: (error: string) => void;
}

export function PromptInput({ onSubmit, onError }: PromptInputProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      const errorMessage = 'Please enter a prompt';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    // Validate the prompt
    const validation = PromptEngineer.validatePrompt(prompt);
    if (!validation.isValid) {
      const errorMessage = validation.issues.join(', ');
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      onSubmit?.(prompt);
      router.push('/dashboard/gallery');
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [prompt, router, onSubmit, onError]);

  const handleRefinePrompt = useCallback(async () => {
    if (!prompt.trim()) {
      const errorMessage = 'Please enter a prompt to refine';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get refinement suggestions
      const refinements = PromptRefiner.refinePrompt(prompt);
      if (refinements.length > 0) {
        // Use the first refinement as it's typically the most relevant
        setPrompt(refinements[0].example);
      }
    } catch (error) {
      console.error('Error refining prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refine prompt';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [prompt, onError]);

  const handleGetIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get prompt suggestions
      const suggestions = PromptEngineer.generatePromptSuggestions(prompt || 'creative image');
      if (suggestions.length > 0) {
        // Use the highest confidence suggestion
        setPrompt(suggestions[0].prompt);
      }
    } catch (error) {
      console.error('Error getting ideas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get ideas';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [prompt, onError]);

  return (
    <Card className="p-4 sm:p-6 w-full">
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Enter your prompt
          </label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            disabled={loading}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleGenerateImage}
            disabled={loading || !prompt.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? <LoadingSpinner /> : 'Generate Image'}
          </Button>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleRefinePrompt}
              disabled={loading || !prompt.trim()}
              className="flex-1 sm:flex-none"
            >
              Refine Prompt
            </Button>
            <Button
              variant="outline"
              onClick={handleGetIdeas}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              Get Ideas
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
      </div>
    </Card>
  );
}
