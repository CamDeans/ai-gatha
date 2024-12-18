'use client';

import { useState, type ComponentProps } from 'react';
import type { MouseEventHandler } from 'react';
import Image from 'next/image';
import { Download, Trash2, type LucideIcon } from 'lucide-react';
import { Button, type ButtonProps as BaseButtonProps } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { cn } from '@/lib/utils';

interface ImageDisplayProps {
  imageUrl: string;
  prompt: string;
  createdAt: string;
  id: string;
  onDelete?: (id: string) => Promise<void>;
}

// Button props type
type ButtonProps = BaseButtonProps & {
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

// Action button props
type ActionButtonProps = Omit<ButtonProps, 'onClick'> & {
  icon: LucideIcon;
  onClick?: () => void | Promise<void>;
};

const ActionButton = ({
  icon: Icon,
  onClick,
  variant = "secondary",
  className,
  ...props
}: ActionButtonProps) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    if (onClick) {
      await onClick();
    }
  };
  
  return (
    <Button
      variant={variant}
      onClick={handleClick}
      size="icon"
      className={cn("h-8 w-8", className)}
      {...props}
    >
      <Icon 
        size={16}
        strokeWidth={2}
      />
    </Button>
  );
};

export default function ImageDisplay({ 
  imageUrl, 
  prompt, 
  createdAt, 
  id,
  onDelete 
}: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Convert base64 to data URL if needed
  const fullImageUrl = imageUrl.startsWith('data:') 
    ? imageUrl 
    : `data:image/jpeg;base64,${imageUrl}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fullImageUrl;
    link.download = `${prompt.slice(0, 30)}-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-200"
          onClick={() => setIsExpanded(true)}
        >
          <Image
            src={fullImageUrl}
            alt={prompt}
            fill
            className={cn(
              'object-cover transition-all hover:scale-105',
              isDeleting && 'opacity-50'
            )}
          />
          
          {/* Overlay with buttons */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-2 right-2 flex gap-2">
              <ActionButton
                icon={Download}
                onClick={handleDownload}
              />
              {onDelete && (
                <ActionButton
                  icon={Trash2}
                  onClick={handleDelete}
                  variant="destructive"
                />
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-sm text-white">{prompt}</p>
              <p className="text-xs text-white/70">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded view dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl">
          <div className="relative aspect-square w-full">
            <Image
              src={fullImageUrl}
              alt={prompt}
              fill
              className="object-contain"
            />
          </div>
          <div className="mt-4">
            <p className="font-medium">{prompt}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 