import { Button } from '@/components/ui/button'
import { Download, Share2, Trash2, Expand, LucideIcon } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ImageActionsProps {
  imageUrl: string
  prompt: string
  onDelete?: () => Promise<boolean>
  showDelete?: boolean
  showShare?: boolean
  className?: string
}

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function ImageActions({ 
  imageUrl = '',
  prompt, 
  onDelete, 
  showDelete = true,
  showShare = true,
  className = ''
}: ImageActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const getCleanUrl = (url: string) => {
    if (!url) return '';
    return url.includes('https://') 
      ? url.substring(url.indexOf('https://'))
      : url;
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      const cleanUrl = getCleanUrl(imageUrl);
      if (!cleanUrl) {
        throw new Error('Invalid image URL');
      }

      // Use our proxy endpoint
      const response = await fetch('/api/images/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: cleanUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download complete',
        description: 'Your image has been downloaded.',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const actualUrl = imageUrl.includes('https://') 
        ? imageUrl.substring(imageUrl.indexOf('https://'))
        : imageUrl

      if (navigator.share) {
        await navigator.share({
          title: prompt,
          text: 'Check out this AI-generated image!',
          url: actualUrl
        })
        toast({
          title: 'Shared successfully',
          description: 'The image has been shared.',
        })
      } else {
        await navigator.clipboard.writeText(actualUrl)
        toast({
          title: 'URL copied',
          description: 'Image URL has been copied to clipboard.',
        })
      }
    } catch (error) {
      console.error('Share failed:', error)
      toast({
        title: 'Share failed',
        description: 'Failed to share the image. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return
    try {
      setIsDeleting(true)
      await onDelete()
      toast({
        title: 'Image deleted',
        description: 'The image has been removed from your gallery.',
      })
    } catch (error) {
      console.error('Delete failed:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const ActionButton = ({ 
    icon: Icon, 
    onClick, 
    disabled = false,
    loading = false,
    className = ""
  }: ActionButtonProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded-lg hover:bg-accent transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Icon className="h-5 w-5" />
      )}
    </button>
  )

  return (
    <>
      <div className="flex gap-2">
        <ActionButton
          icon={Expand}
          onClick={() => setIsExpanded(true)}
        />
        <ActionButton
          icon={Download}
          onClick={handleDownload}
          disabled={isDownloading}
          loading={isDownloading}
        />
        {showShare && (
          <ActionButton
            icon={Share2}
            onClick={handleShare}
          />
        )}
        {showDelete && onDelete && (
          <ActionButton
            icon={Trash2}
            onClick={handleDelete}
            disabled={isDeleting}
            loading={isDeleting}
            className="hover:bg-red-500 hover:text-white"
          />
        )}
      </div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{prompt}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-square w-full">
            <img
              src={getCleanUrl(imageUrl)}
              alt={prompt}
              className="rounded-lg object-contain"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 