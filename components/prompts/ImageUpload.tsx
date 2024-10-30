'use client'

import { useState } from 'react'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onClear: () => void;
  selectedImage?: string | null;
}

export default function ImageUpload({ onImageSelect, onClear, selectedImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      validateAndProcessImage(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      validateAndProcessImage(files[0])
    }
  }

  const validateAndProcessImage = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    onImageSelect(file)
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedImage ? (
          <div className="relative aspect-square w-full max-w-sm mx-auto">
            <Image
              src={selectedImage}
              alt="Selected image"
              fill
              className="object-contain rounded-lg"
            />
            <button
              onClick={onClear}
              className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background border shadow-sm"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
              >
                <span>Upload an image</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 