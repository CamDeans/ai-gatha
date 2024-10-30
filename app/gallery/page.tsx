'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ImageDisplay from '@/components/dashboard/ImageDisplay'

interface GalleryImage {
  id: string
  imageUrl: string
  prompt: string
  createdAt: string
}

export default function Gallery() {
  const { data: session } = useSession()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/gallery')
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }
        const data = await response.json()
        setImages(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchImages()
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Gallery</h1>
      {images.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No images yet. Generate some images to see them here!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="cursor-card">
              <ImageDisplay imageUrl={image.imageUrl} />
              <div className="p-4">
                <p className="text-sm text-muted-foreground">{image.prompt}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 