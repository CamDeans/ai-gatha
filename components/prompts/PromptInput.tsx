'use client'

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AISparkleIcon } from '../icons/AISparkleIcon';
import { Button } from '../ui/button';

interface PromptInputProps {
  onImageGenerated: (imageUrl: string | null) => void;
  onPromptChange: (prompt: string) => void;
  onRefinementClick: () => void;
  onSuggestionsClick: () => void;
  onAdvancedClick: () => void;
  showAdvanced: boolean;
}

export default function PromptInput({ 
  onImageGenerated, 
  onPromptChange,
  onRefinementClick,
  onSuggestionsClick,
  onAdvancedClick,
  showAdvanced
}: PromptInputProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    onPromptChange(newPrompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      onImageGenerated(data.imageUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate image');
      onImageGenerated(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Describe the image you want to generate..."
          className="w-full min-h-[100px] p-4 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <AISparkleIcon className="h-4 w-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onSuggestionsClick}
          className="group"
        >
          <AISparkleIcon className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
          Get Ideas
        </Button>

        <Button
          variant="outline"
          onClick={onRefinementClick}
          disabled={!prompt.trim()}
          className="group"
        >
          <AISparkleIcon className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
          Refine
        </Button>

        <Button
          variant="outline"
          onClick={onAdvancedClick}
          className="group"
        >
          <AISparkleIcon className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </Button>
      </div>
    </div>
  );
} 