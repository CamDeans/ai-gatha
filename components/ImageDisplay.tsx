'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ImageDisplayProps {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
  onDelete?: (id: string) => Promise<void>;
  onClick?: () => void;
  priority?: boolean;
}

export default function ImageDisplay({ 
  id,
  prompt, 
  imageUrl, 
  createdAt,
  onDelete,
  onClick,
  priority = false
}: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullImageUrl = imageUrl.startsWith('data:') 
    ? imageUrl 
    : `data:image/png;base64,${imageUrl}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(fullImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <div 
        className={cn(
          "relative aspect-square rounded-lg overflow-hidden bg-background/50",
          onClick && "cursor-pointer group"
        )}
        onClick={onClick}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!error && (
          <div className="relative h-full">
            <Image
              src={fullImageUrl}
              alt={prompt}
              fill
              className={cn(
                "object-cover",
                onClick && "group-hover:opacity-75 transition-opacity duration-200"
              )}
              priority={priority}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                console.error('Failed to load image:', fullImageUrl.substring(0, 100) + '...');
                setError('Failed to load image');
                setIsLoading(false);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={true}
            />
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Download size={16} />
                </Button>
                {onDelete && (
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-sm text-white">{prompt}</p>
                <p className="text-xs text-white/70">
                  {new Date(createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 