'use client';

import { useEffect, useState } from 'react';
import { ImageCard, type Image } from '@/components/gallery/ImageCard';
import { ImageExpand } from '@/components/gallery/ImageExpand';
import { useInView } from 'react-intersection-observer';
import { Loader } from 'lucide-react';

export default function Gallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  const fetchImages = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/images?page=${pageNum}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      
      if (pageNum === 1) {
        setImages(data.images);
      } else {
        setImages(prev => [...prev, ...data.images]);
      }
      
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(page);
  }, [page]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, isLoading]);

  if (!images.length && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>No images found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id}>
            <ImageCard
              image={image}
              onExpand={() => setSelectedImage(image)}
            />
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader className="animate-spin" />
        </div>
      )}

      {hasMore && !isLoading && (
        <div ref={ref} className="h-10" />
      )}

      <ImageExpand
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        prompt={selectedImage?.prompt}
      />
    </div>
  );
} 