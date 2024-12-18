'use client';

import { useState } from 'react';
import PromptInput from '@/components/dashboard/PromptInput';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Share, Loader } from 'lucide-react';
import PromptRefinementModal from '@/components/prompts/PromptRefinementModal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Dashboard() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRefinement, setShowRefinement] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const { toast } = useToast();

  const handleImageGenerated = (imageUrl: string | null) => {
    setCurrentImage(imageUrl);
    setIsGenerating(false);
    
    if (!imageUrl) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Failed to generate image. Please try again.",
      });
    } else {
      toast({
        title: "Image generated",
        description: "Your image has been generated successfully.",
      });
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;

    try {
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download image. Please try again.",
      });
    }
  };

  const handleShare = async () => {
    if (!currentImage) return;

    try {
      await navigator.clipboard.writeText(currentImage);
      toast({
        title: "Link copied",
        description: "Image link copied to clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Share failed",
        description: "Failed to copy link. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Image Generation Section */}
      <div className="flex flex-col gap-8">
        <PromptInput
          onImageGenerated={handleImageGenerated}
          onPromptChange={setCurrentPrompt}
          onRefinementClick={() => setShowRefinement(true)}
        />

        {/* Generated Image Display */}
        {(currentImage || isGenerating) && (
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Generated Image</h2>
              {currentImage && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              )}
            </div>

            <div className="relative aspect-square rounded-lg border bg-muted">
              {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : currentImage ? (
                <>
                  <Image
                    src={currentImage}
                    alt={currentPrompt}
                    fill
                    className="object-contain rounded-lg cursor-pointer"
                    onClick={() => setShowFullscreen(true)}
                    priority
                  />
                  {currentPrompt && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white rounded-b-lg">
                      <p className="text-sm">{currentPrompt}</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </Card>
        )}
      </div>

      {/* Fullscreen Image Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Generated Image</DialogTitle>
          <DialogDescription>
            {currentPrompt}
          </DialogDescription>
          <div className="relative aspect-square w-full">
            {currentImage && (
              <Image
                src={currentImage}
                alt={currentPrompt}
                fill
                className="object-contain"
                priority
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Refinement Modal */}
      <PromptRefinementModal
        isOpen={showRefinement}
        onClose={() => setShowRefinement(false)}
        currentPrompt={currentPrompt}
        onSelectRefinement={setCurrentPrompt}
      />
    </div>
  );
}
