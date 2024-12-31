'use client'

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WandIcon } from '@/components/icons/WandIcon';
import PromptRefinementModal from './PromptRefinementModal';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export default function PromptInput({ onSubmit, isLoading = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isRefinementOpen, setIsRefinementOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleRefinementSelect = (refinedPrompt: string) => {
    setPrompt(refinedPrompt);
    // Focus and update the textarea
    if (textareaRef.current) {
      textareaRef.current.value = refinedPrompt;
      textareaRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="min-h-[100px] resize-none pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => setIsRefinementOpen(true)}
        >
          <WandIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      <PromptRefinementModal
        isOpen={isRefinementOpen}
        onClose={() => setIsRefinementOpen(false)}
        currentPrompt={prompt}
        onSelectRefinement={handleRefinementSelect}
      />
    </form>
  );
}
