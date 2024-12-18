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
import { useToast } from '@/components/ui/use-toast';
import { PromptTemplate } from "@/lib/prompts/database";
import { cn } from "@/lib/utils";
import type { ButtonProps as BaseButtonProps } from '@/components/ui/button';

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

  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

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

  const handleGenerate = async () => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Please sign in to generate images",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          userId: session.user.id  // Make sure we're sending userId
        }),
      });

      const data: GenerateResponse = await response.json();
      console.log('Generation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.success && data.image) {
        onImageGenerated(data.image);
        toast({
          title: "Success",
          description: "Image generated successfully",
        });
      } else {
        throw new Error('No image data received');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate image',
      });
      onImageGenerated(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetIdeas = useCallback(() => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt first",
      });
      return;
    }

    try {
      // Generate suggestions using the current prompt
      const ideas = PromptEngineer.generatePromptSuggestions(prompt);
      
      if (ideas.length === 0) {
        toast({
          variant: "destructive",
          title: "No suggestions",
          description: "No suggestions available for this prompt. Try being more specific.",
        });
        return;
      }

      setSuggestions(ideas);
      setShowIdeasModal(true);
      
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
      });
    }
  }, [prompt, toast]);

  const handleSelectIdea = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    onPromptChange(selectedPrompt);
    setShowIdeasModal(false);
    toast({
      title: "Prompt selected",
      description: "The prompt has been updated with your selection.",
    });
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
            onClick={handleGenerate}
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
              'Generate'
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
