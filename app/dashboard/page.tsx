'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';
import { Card } from '@/components/ui/card';
import { PromptEngineer } from '@/lib/prompts/engineer';
import { PromptEnhancer } from '@/lib/prompts/enhancer';
import { PromptRefiner } from '@/lib/prompts/refiner';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <div className="text-center p-4">Please sign in to access the dashboard</div>;
  }

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    // Validate the prompt
    const validation = PromptEngineer.validatePrompt(prompt);
    if (!validation.isValid) {
      setError(validation.issues.join(', '));
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
      router.push('/dashboard/gallery'); // Updated routing
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleRefinePrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to refine');
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
      setError(error instanceof Error ? error.message : 'Failed to refine prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleGetIdeas = async () => {
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
      setError(error instanceof Error ? error.message : 'Failed to get ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to enhance');
      return;
    }

    try {
      // Enhance the prompt with premium quality settings
      const enhancedPrompt = PromptEnhancer.enhancePrompt(prompt, {
        quality: 'premium',
        style: 'photorealistic',
        details: ['sharp focus', 'dynamic lighting', 'rich textures']
      });
      setPrompt(enhancedPrompt);
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to enhance prompt');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Image Generation</h1>
      </div>

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
              <Button
                variant="outline"
                onClick={handleEnhancePrompt}
                disabled={loading || !prompt.trim()}
                className="flex-1 sm:flex-none"
              >
                Enhance Prompt
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <div className="space-y-6 mt-4 p-4 sm:p-6 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div>
                <h3 className="font-medium mb-4">Style Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {Object.entries(PromptEngineer.styles).map(([style, description]) => (
                    <Button
                      key={style}
                      variant="outline"
                      onClick={() => setPrompt(prev => `${prev}, ${description}`)}
                      className="justify-start hover:bg-gray-100 dark:hover:bg-gray-700 text-sm sm:text-base"
                    >
                      Add {style} style
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Quality Enhancements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {Object.entries(PromptEnhancer.qualities).map(([quality, description]) => (
                    <Button
                      key={quality}
                      variant="outline"
                      onClick={() => {
                        const enhancedPrompt = PromptEnhancer.enhancePrompt(prompt, {
                          quality: quality as 'standard' | 'premium' | 'maximum' | 'balanced'
                        });
                        setPrompt(enhancedPrompt);
                      }}
                      className="justify-start hover:bg-gray-100 dark:hover:bg-gray-700 text-sm sm:text-base"
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)} Quality
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Lighting & Composition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {Object.entries(PromptEnhancer.lighting).map(([light, description]) => (
                    <Button
                      key={light}
                      variant="outline"
                      onClick={() => {
                        const enhancedPrompt = PromptEnhancer.enhancePrompt(prompt, {
                          lighting: light
                        });
                        setPrompt(enhancedPrompt);
                      }}
                      className="justify-start hover:bg-gray-100 dark:hover:bg-gray-700 text-sm sm:text-base"
                    >
                      {light.charAt(0).toUpperCase() + light.slice(1)} Lighting
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Detail Enhancements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {PromptEnhancer.details.map((detail) => (
                    <Button
                      key={detail}
                      variant="outline"
                      onClick={() => {
                        const enhancedPrompt = PromptEnhancer.enhancePrompt(prompt, {
                          details: [detail]
                        });
                        setPrompt(enhancedPrompt);
                      }}
                      className="justify-start hover:bg-gray-100 dark:hover:bg-gray-700 text-sm sm:text-base"
                    >
                      Add {detail}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </div>
      </Card>
    </div>
  );
}
