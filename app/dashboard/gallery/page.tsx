'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import ImageDisplay from '@/components/ImageDisplay';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error';

interface Image {
  id: string;
  prompt: string;
  imageUrl: string | string[];
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  images: Image[];
  error?: string;
}

const ITEMS_PER_PAGE = 12;

export default function Gallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { ref, inView } = useInView();

  useEffect(() => {
    fetchImages(true);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoad) {
      fetchImages(false);
    }
  }, [inView, hasMore, loading, initialLoad]);

  async function fetchImages(isInitialFetch: boolean) {
    try {
      setLoading(true);
      const currentPage = isInitialFetch ? 1 : page;
      const response = await fetch(`/api/gallery?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      const data = await response.json() as ApiResponse;
      
      if (data.success) {
        setImages(prev => {
          const newImages = isInitialFetch ? data.images : [...prev, ...data.images];
          // Remove duplicates based on id while maintaining type safety
          const uniqueImages = Array.from(
            new Map(
              newImages.map((img: Image) => [img.id, img])
            ).values()
          ) as Image[];
          return uniqueImages;
        });
        setHasMore(data.images.length === ITEMS_PER_PAGE);
        setPage(prev => isInitialFetch ? 2 : prev + 1);
      } else {
        console.error('Failed to fetch images:', data.error);
        setError(data.error || 'Failed to fetch images');
      }
    } catch (err) {
      console.error('Gallery error:', err);
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleRetry = () => {
    setError(null);
    setInitialLoad(true);
    setPage(1);
    fetchImages(true);
  };

  // Show loading spinner on initial load
  if (initialLoad && loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error message if there's an error and no images
  if (error && images.length === 0) {
    return (
      <div className="p-4">
        <ErrorMessage 
          message={error} 
          retry={handleRetry}
        />
      </div>
    );
  }

  // Show "No images" message if there are no images and no error
  if (!loading && images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <p className="text-lg text-muted-foreground">No images found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Generate some images to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((image) => (
          <ImageDisplay
            key={image.id}
            id={image.id}
            imageUrl={image.imageUrl}
            prompt={image.prompt}
            createdAt={image.createdAt}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {/* Loading/Intersection Observer trigger */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {loading && !initialLoad && <LoadingSpinner />}
        {!hasMore && images.length > 0 && (
          <p className="text-sm text-muted-foreground">No more images to load</p>
        )}
      </div>
    </div>
  );
} 