'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ImageDisplay from '@/components/dashboard/ImageDisplay'
import { toast } from 'sonner'
import { TrashIcon } from '@heroicons/react/24/outline'

interface GalleryImage {
  id: string
  imageUrl: string
  prompt: string
  createdAt: string
}

export default function GalleryPage() {
  const { data: session } = useSession()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchImages()
  }, [session])

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

  async function handleDelete(imageId: string) {
    try {
      setDeleting(imageId)
      const response = await fetch('/api/gallery/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete image')
      }

      // Remove the image from the local state
      setImages(images.filter(img => img.id !== imageId))
      toast.success('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Gallery</h1>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No images yet. Generate some images to see them here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="group bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="aspect-square relative">
                <ImageDisplay imageUrl={image.imageUrl} />
                <button
                  onClick={() => handleDelete(image.id)}
                  disabled={deleting === image.id}
                  className={`absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${
                    deleting === image.id ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  title="Delete image"
                >
                  {deleting === image.id ? (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TrashIcon className="h-5 w-5 text-destructive" />
                  )}
                </button>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {image.prompt}
                </p>
                <p className="text-xs text-muted-foreground">
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