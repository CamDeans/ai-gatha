import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageCardProps {
  imageUrl: string;
  prompt?: string;
  onDelete?: () => void;
}

export function ImageCard({ imageUrl, prompt, onDelete }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Log detailed information about the received props
    console.log('ImageCard mounted/updated:', {
      hasUrl: !!imageUrl,
      urlLength: imageUrl?.length,
      urlPreview: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'MISSING',
      hasPrompt: !!prompt,
      promptPreview: prompt?.substring(0, 50)
    });

    // Reset states when URL changes
    setIsLoading(true);
    setError(false);

    // Pre-load the image to check if it's valid
    if (imageUrl?.trim()) {
      console.log('Pre-loading image:', imageUrl);
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        console.log('Image pre-loaded successfully:', {
          url: imageUrl,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        });
        setIsLoading(false);
        setError(false);
      };
      img.onerror = (e: Event | string) => {
        console.error('Image failed to pre-load:', {
          url: imageUrl,
          error: e,
          type: typeof e,
          keys: e instanceof Event ? Object.keys(e) : []
        });
        setError(true);
        setIsLoading(false);
      };
    } else {
      console.log('No valid image URL to pre-load');
      setError(true);
      setIsLoading(false);
    }
  }, [imageUrl]);

  // Return early if no valid image URL
  if (!imageUrl?.trim()) {
    console.log('No valid image URL provided for render');
    return (
      <Card className="overflow-hidden">
        <div className="p-0 relative aspect-square">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">No image available</p>
          </div>
        </div>
        {prompt && (
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{prompt}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full">
      <div className="p-0 relative aspect-square">
        {isLoading && !error && (
          <div className="absolute inset-0">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        <Image
          src={imageUrl}
          alt={prompt || 'Generated image'}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading || error ? 'opacity-0' : 'opacity-100'
          }`}
          onLoadingComplete={() => {
            console.log('Image loaded successfully:', imageUrl);
            setIsLoading(false);
          }}
          onError={(e) => {
            setError(true);
            setIsLoading(false);
            console.error('Image failed to load:', {
              url: imageUrl,
              error: e,
              type: typeof e,
              keys: Object.keys(e)
            });
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={75}
          priority={false}
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load image</p>
          </div>
        )}
      </div>
      {prompt && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-sm text-gray-500 dark:text-gray-400">{prompt}</p>
        </div>
      )}
    </Card>
  );
} 