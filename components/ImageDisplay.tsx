'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader, Download, Trash, ZoomIn } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { formatDate } from '@/lib/utils';

interface ImageDisplayProps {
  id: string;
  imageUrl: string | string[];
  prompt: string;
  createdAt: string;
  onDelete?: (id: string) => void;
}

export default function ImageDisplay({ id, imageUrl, prompt, createdAt, onDelete }: ImageDisplayProps) {
  const [fullImage, setFullImage] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    try {
      const imageData = Array.isArray(imageUrl) ? imageUrl.join('') : imageUrl;
      
      if (!imageData || typeof imageData !== 'string') {
        throw new Error('Invalid image data');
      }

      const base64Data = imageData.startsWith('data:image') 
        ? imageData 
        : `data:image/png;base64,${imageData}`;

      setFullImage(base64Data);
      setIsLoading(false);
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to load image');
      setIsLoading(false);
    }
  }, [imageUrl]);

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = fullImage;
      link.download = `image-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete image');
      
      onDelete?.(id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
        <div className="relative aspect-square">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
              <p className="text-sm text-destructive">Failed to load image</p>
            </div>
          ) : (
            <Image
              src={fullImage}
              alt={prompt}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onLoadingComplete={() => setIsLoading(false)}
              onError={() => {
                console.error('Image load error for:', id);
                setError('Failed to load image');
                setIsLoading(false);
              }}
              priority
            />
          )}

          {/* Action Buttons Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setShowFullscreen(true)}
                className="h-8 w-8"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleDownload}
                className="h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8"
              >
                {isDeleting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-card-foreground line-clamp-2">{prompt}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(createdAt)}
          </p>
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
            <DialogDescription>
              {prompt}
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-square w-full">
            <Image
              src={fullImage}
              alt={prompt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 