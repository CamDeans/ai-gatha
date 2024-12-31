import Image from 'next/image';
import { Card } from '@/components/ui/card';

export interface Image {
  id: string;
  url: string;
  prompt?: string;
  createdAt: string;
}

export interface ImageCardProps {
  image: Image;
  onExpand: () => void;
}

export function ImageCard({ image, onExpand }: ImageCardProps) {
  return (
    <Card 
      className="relative aspect-square overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onExpand}
    >
      <Image
        src={image.url}
        alt={image.prompt || 'Generated image'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </Card>
  );
} 