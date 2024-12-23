'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(id);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  const fullImageUrl = imageUrl.startsWith('data:') 
    ? imageUrl 
    : `data:image/png;base64,${imageUrl}`;

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
              unoptimized={true}
            />
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-2 right-2 flex gap-2">
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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