'use client';

import { useState, useEffect } from 'react'
import { ImageCard } from '@/components/ImageCard'
import { ImageActions } from '@/components/ImageActions'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading'
import Link from 'next/link'

interface RawImage {
  _id: string;
  imageUrl?: string;
  cleanedUrl?: string;
  prompt?: string;
}

interface ProcessedImage {
  _id: string;
  imageUrl: string;
  prompt?: string;
}

export default function GalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchImages() {
      try {
        console.log('Fetching images for gallery...')
        const response = await fetch('/api/gallery')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch images: ${response.status}`)
        }
        
        const rawData = await response.json()
        console.log('Raw API response:', rawData)

        // Validate the response data
        if (!rawData) {
          console.error('Empty response received')
          throw new Error('Empty response received from server')
        }

        // Transform and validate each image
        const validImages = (rawData as RawImage[])
          .map(img => {
            // Log the raw image data
            console.log('Processing raw image:', {
              id: img._id,
              hasOriginalUrl: !!img.imageUrl,
              hasCleanedUrl: !!img.cleanedUrl,
              originalUrlPreview: img.imageUrl?.substring(0, 50),
              cleanedUrlPreview: img.cleanedUrl?.substring(0, 50)
            })

            // Create processed image object
            const processedImage: ProcessedImage = {
              _id: img._id,
              imageUrl: img.imageUrl || '', // Use the original imageUrl
              prompt: img.prompt
            }

            // Log the processed image
            console.log('Processed image:', {
              id: processedImage._id,
              hasUrl: !!processedImage.imageUrl,
              urlPreview: processedImage.imageUrl ? `${processedImage.imageUrl.substring(0, 50)}...` : 'MISSING',
              prompt: processedImage.prompt
            })

            return processedImage
          })
          .filter((img): img is ProcessedImage => {
            const hasValidId = typeof img._id === 'string' && img._id.length > 0;
            const hasValidUrl = typeof img.imageUrl === 'string' && img.imageUrl.trim().length > 0;
            const isValid = hasValidId && hasValidUrl;
            
            if (!isValid) {
              console.warn('Filtered out invalid image:', img);
            }
            return isValid;
          })

        console.log('Final valid images:', {
          count: validImages.length,
          images: validImages.map(img => ({
            id: img._id,
            hasUrl: !!img.imageUrl,
            urlPreview: img.imageUrl ? `${img.imageUrl.substring(0, 50)}...` : 'MISSING'
          }))
        })

        if (validImages.length === 0) {
          console.warn('No valid images found in response')
          setError('No valid images found')
        } else {
          setImages(validImages)
        }
      } catch (error) {
        console.error('Error fetching images:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch images')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchImages()
    }
  }, [session])

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/gallery/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete image');
      }

      // Only remove the image from state if the delete was successful
      setImages(prevImages => prevImages.filter(img => img._id !== imageId));
      
      // Return true to indicate success to the ImageActions component
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error; // Let ImageActions handle the error display
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!session) {
    return <div className="text-center p-4">Please sign in to view your gallery</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Image Gallery</h1>
      </div>

      {error ? (
        <div className="text-center text-red-500 p-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => {
            // Log the image data being passed to ImageCard
            console.log('Rendering ImageCard with:', {
              id: image._id,
              imageUrl: image.imageUrl,
              hasUrl: !!image.imageUrl,
              urlLength: image.imageUrl?.length,
              urlPreview: image.imageUrl ? `${image.imageUrl.substring(0, 50)}...` : 'MISSING',
              prompt: image.prompt?.substring(0, 50)
            })
            
            return (
              <div key={image._id} className="relative group h-full">
                <div className="flex flex-col h-full">
                  <ImageCard
                    imageUrl={image.imageUrl}
                    prompt={image.prompt}
                  />
                  <div className="mt-2 px-4 pb-4 flex justify-end gap-2">
                    <ImageActions
                      imageUrl={image.imageUrl}
                      prompt={image.prompt || ''}
                      onDelete={() => handleDeleteImage(image._id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {images.length === 0 && !error && (
        <div className="text-center text-gray-500 p-4">
          No images found. Generate some images to see them here!
        </div>
      )}
    </div>
  )
} 