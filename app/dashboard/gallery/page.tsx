'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSession } from 'next-auth/react';
import ImageDisplay from '@/components/ImageDisplay';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';

interface Image {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

export default function Gallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const { ref, inView } = useInView();
  const { data: session } = useSession();

  const fetchImages = useCallback(async (pageNum: number = 1) => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/gallery?page=${pageNum}&limit=12&userId=${session.user.id}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      console.log('Fetched images:', data);

      const imageArray = Array.isArray(data) ? data : data.images || [];
      
      if (pageNum === 1) {
        setImages(imageArray);
      } else {
        setImages(prev => [...prev, ...imageArray]);
      }
      
      setHasMore(imageArray.length === 12);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchImages(1);
    }
  }, [fetchImages, session?.user?.id]);

  useEffect(() => {
    if (inView && hasMore && !loading && session?.user?.id) {
      setPage(prev => {
        const nextPage = prev + 1;
        fetchImages(nextPage);
        return nextPage;
      });
    }
  }, [inView, hasMore, loading, fetchImages, session?.user?.id]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(images.filter(img => img.id !== id));
      
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  if (loading && !images.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !images.length) {
    return (
      <div className="p-4">
        <ErrorMessage 
          title="Failed to load gallery"
          message={error} 
          retry={() => fetchImages(1)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {(!images || images.length === 0) && !loading ? (
          <div className="text-center">
            <p className="text-muted-foreground">No images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.isArray(images) && images.map((image, index) => (
              <ImageDisplay 
                key={image.id}
                {...image}
                onDelete={handleDelete}
                onClick={() => setSelectedImage(image)}
                priority={index < 4}
              />
            ))}
          </div>
        )}
        
        <div ref={ref} className="h-10 flex items-center justify-center">
          {loading && <LoadingSpinner />}
          {!hasMore && images.length > 0 && (
            <p className="text-sm text-muted-foreground">No more images to load</p>
          )}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative aspect-square w-full">
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <LoadingSpinner />
                  </div>
                )}
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.prompt}
                  fill
                  className="object-contain"
                  priority
                  onLoadStart={() => setPreviewLoading(true)}
                  onLoadingComplete={() => setPreviewLoading(false)}
                  onError={() => {
                    setPreviewLoading(false);
                    toast.error('Failed to load image preview');
                  }}
                />
              </div>
              <div className="space-y-2">
                <p className="font-medium">Prompt</p>
                <p className="text-sm text-muted-foreground">{selectedImage.prompt}</p>
                <p className="text-xs text-muted-foreground">
                  Created on {new Date(selectedImage.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 