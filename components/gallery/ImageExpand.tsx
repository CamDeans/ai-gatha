'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageExpandProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt?: string;
}

export function ImageExpand({
  isOpen,
  onClose,
  imageUrl,
  prompt
}: ImageExpandProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <DialogDescription className="sr-only">
          {prompt || 'Generated image preview'}
        </DialogDescription>
        <div className="relative">
          <div className="aspect-square relative">
            <Image
              src={imageUrl}
              alt={prompt || 'Generated image'}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          {prompt && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-sm line-clamp-2">
                {prompt}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 