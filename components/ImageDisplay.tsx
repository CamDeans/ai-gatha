'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading';

interface ImageDisplayProps {
  image: {
    _id: string;
    url: string;
    prompt: string;
    createdAt: string;
  };
  onDelete?: (id: string) => void;
  priority?: boolean;
}

export default function ImageDisplay({ image, onDelete, priority = false }: ImageDisplayProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/images/${image._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      toast.success('Image deleted successfully');
      onDelete?.(image._id);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!image.url || imageError) {
    return (
      <div className="aspect-square relative overflow-hidden rounded-lg bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Image not available</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="aspect-square relative overflow-hidden rounded-lg">
        <Image
          src={image.url}
          alt={image.prompt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/50 flex items-center justify-center">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
} 