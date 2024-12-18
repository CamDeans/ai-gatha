'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSession } from 'next-auth/react';
import ImageDisplay from '@/components/ImageDisplay';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error';
import { toast } from 'sonner';

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
  
  const { ref, inView } = useInView();
  const { data: session, status } = useSession();
  console.log('Current session:', session, 'Status:', status);

  const fetchImages = useCallback(async (pageNum: number = 1) => {
    if (!session?.user?.id) {
      console.log('No session available, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching images for user:', session.user.id);
      
      const response = await fetch(`/api/gallery?page=${pageNum}&limit=12&userId=${session.user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.images)) {
        console.log('Received images:', data.images.map((img: Image) => ({
          id: img.id,
          userId: img.userId,
          promptLength: img.prompt?.length,
          imageUrlLength: img.imageUrl?.length,
          hasDataPrefix: img.imageUrl?.startsWith('data:'),
          createdAt: img.createdAt,
          matchesSession: img.userId === session.user.id
        })));

        const filteredImages = data.images.filter((img: Image) => img.userId === session.user.id);
        setImages(prev => pageNum === 1 ? filteredImages : [...prev, ...filteredImages]);
        
        if (filteredImages.length !== data.images.length) {
          console.warn('Some images were filtered out due to userId mismatch');
        }
        
        setHasMore(data.hasMore);
        setPage(pageNum);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Gallery error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Session authenticated, fetching images...');
      fetchImages(1);
    }
  }, [status, session, fetchImages]);

  useEffect(() => {
    if (inView && hasMore && !loading && session?.user?.id) {
      fetchImages(page + 1);
    }
  }, [inView, hasMore, loading, page, fetchImages, session]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(prev => prev.filter(img => img.id !== id));
      toast.success('Image deleted successfully');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  if (status === 'loading' || (loading && images.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && images.length === 0) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map(({ id, prompt, imageUrl, createdAt }) => (
          <div key={id}>
            <ImageDisplay 
              id={id}
              prompt={prompt}
              imageUrl={imageUrl}
              createdAt={createdAt}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
      
      {/* Loading/Intersection Observer trigger */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {loading && <LoadingSpinner />}
        {!hasMore && images.length > 0 && (
          <p className="text-sm text-muted-foreground">No more images to load</p>
        )}
      </div>
    </div>
  );
} 