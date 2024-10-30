/**
 * ImageDisplay component
 * Displays generated images with proper styling and loading states
 */
'use client'

import { useState } from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
}

export default function ImageDisplay({ imageUrl }: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!imageUrl) return null;

  const handleOpenImage = () => {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full w-full flex flex-col bg-card text-card-foreground rounded-lg border shadow-sm overflow-hidden">
      <div className="flex-1 relative min-h-0 bg-muted">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <div className="loading-spinner" />
          </div>
        )}
        <div 
          className="h-full w-full flex items-center justify-center p-4" >
          <img 
            src={imageUrl} 
            alt="Generated image"
            className={`max-h-full max-w-full object-contain transition-opacity duration-300 hover:opacity-90 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
      <div className="flex-none p-4 border-t border-border">
        <div className="flex justify-between items-center gap-4">
          <button 
            className="flex-1 btn-primary"
            onClick={handleDownload}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
} 