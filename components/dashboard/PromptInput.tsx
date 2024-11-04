'use client';

import { useState, useCallback } from 'react';
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

  const handlePromptChange = (value: string) => {
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
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt first",
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
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data: GenerateResponse = await response.json();
      console.log('Generation response:', data); // Debug log

      if (data.success && data.image) {
        // Add base64 prefix if not present
        const imageUrl = data.image.startsWith('data:image') 
          ? data.image 
          : `data:image/png;base64,${data.image}`;
        
        onImageGenerated(imageUrl);
        toast({
          title: "Success",
          description: "Image generated successfully",
        });
      } else {
        throw new Error(data.error || 'No image generated');
      }
    } catch (error) {
      console.error('Generation error:', error);
      onImageGenerated(null);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate image',
      });
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
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="flex-1 min-h-[100px] p-3 rounded-lg border bg-background resize-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={handleGetIdeas}
              variant="outline"
              disabled={prompt.length === 0 || isGenerating}
            >
              Get Ideas
            </Button>
            <Button
              onClick={onRefinementClick}
              variant="outline"
              disabled={prompt.length === 0 || isGenerating}
            >
              Refine Prompt
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={prompt.length === 0 || isGenerating}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </div>

          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            className="group"
          >
            <AISparkleIcon className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>
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
