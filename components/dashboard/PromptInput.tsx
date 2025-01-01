'use client';

import { useState, useCallback, ChangeEvent, forwardRef, ComponentProps, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AISparkleIcon } from '../icons/AISparkleIcon';
import { Button } from '../ui/button';
import { PromptEngineer } from '@/lib/prompts/engineer';
import PromptModal from '../prompts/PromptModal';
import AdvancedPromptControls from '../prompts/AdvancedPromptControls';
import { Loader } from 'lucide-react';
import { PromptTemplate } from "@/lib/prompts/database";
import { cn } from "@/lib/utils";
import type { ButtonProps as BaseButtonProps } from '@/components/ui/button';
import { toast } from 'sonner';

interface PromptInputProps {
  onImageGenerated: (imageUrl: string | null) => void;
  onPromptChange: (prompt: string) => void;
  onRefinementClick: () => void;
}

interface GenerateResponse {
  success: boolean;
  image?: string;
  error?: string;
}

// Define proper button props type
interface ButtonProps extends BaseButtonProps, 
  Omit<ComponentProps<'button'>, keyof BaseButtonProps> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onClick?: () => void | Promise<void>;
  type?: 'button' | 'submit' | 'reset';
}

// Update the CustomButton component
const CustomButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  )
);

CustomButton.displayName = 'CustomButton';

// Update the Loader usage
const StyledLoader = () => (
  <span className="mr-2">
    <span className="h-4 w-4 inline-block">
      <Loader size={16} />
    </span>
  </span>
);

export default function PromptInput({ 
  onImageGenerated, 
  onPromptChange, 
  onRefinementClick 
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    prompt: string;
    confidence: number;
    template: PromptTemplate;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    onPromptChange(value);
    if (value.length > 3) {
      const newSuggestions = PromptEngineer.generatePromptSuggestions(value);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!prompt.trim()) {
      toast.error("Please enter a description of the image you want to generate");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      toast.success("Image generated successfully!");
      onImageGenerated(data.image);
      
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetIdeas = useCallback(() => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }

    try {
      const ideas = PromptEngineer.generatePromptSuggestions(prompt);
      
      if (ideas.length === 0) {
        toast.error("No suggestions available for this prompt. Try being more specific.");
        return;
      }

      setSuggestions(ideas);
      setShowIdeasModal(true);
      
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast.error("Failed to generate ideas. Please try again.");
    }
  }, [prompt]);

  const handleSelectIdea = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    onPromptChange(selectedPrompt);
    setShowIdeasModal(false);
    toast.success("The prompt has been updated with your selection");
  };

  return (
    <div className="space-y-4 max-w-[100%] px-6">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Describe the image you want to generate..."
          className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-none"
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <CustomButton
            onClick={handleGetIdeas}
            variant="outline"
            disabled={prompt.length === 0 || isGenerating}
            type="button"
          >
            Get Ideas
          </CustomButton>
          <CustomButton
            onClick={onRefinementClick}
            variant="outline"
            disabled={prompt.length === 0 || isGenerating}
            type="button"
          >
            Refine Prompt
          </CustomButton>
          <CustomButton
            onClick={() => handleGenerate()}
            disabled={prompt.length === 0 || isGenerating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            type="button"
          >
            {isGenerating ? (
              <>
                <StyledLoader />
                Generating...
              </>
            ) : (
              <>
                <AISparkleIcon className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </CustomButton>
        </div>

        <CustomButton
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="ghost"
          className="group"
          type="button"
        >
          <AISparkleIcon className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
          Advanced Options
        </CustomButton>
      </div>

      {showAdvanced && (
        <AdvancedPromptControls
          basePrompt={prompt}
          onPromptUpdate={onPromptChange}
        />
      )}

      {showIdeasModal && (
        <PromptModal
          isOpen={showIdeasModal}
          onClose={() => setShowIdeasModal(false)}
          suggestions={suggestions}
          onSelect={handleSelectIdea}
        />
      )}
    </div>
  );
}
