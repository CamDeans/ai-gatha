import { connectToDatabase } from '@/lib/db';
import { GeneratedImage } from '@/types/image';
import { ObjectId } from 'mongodb';

function cleanImageUrl(url: string): string {
  console.log('Cleaning image URL:', {
    original: url,
    type: typeof url,
    length: url?.length
  });

  // If no URL provided, return empty string
  if (!url) {
    console.log('No URL provided');
    return '';
  }

  // If the URL contains both data:image and https://, extract just the https URL
  if (url.includes('data:image') && url.includes('https://')) {
    const httpsMatch = url.match(/https:\/\/[^"\s,}]+/);
    if (httpsMatch) {
      const cleanedUrl = httpsMatch[0];
      // Remove any trailing quotes or commas
      const finalUrl = cleanedUrl.replace(/[",}]+$/, '');
      console.log('Extracted HTTPS URL:', finalUrl);
      return finalUrl;
    }
  }

  // If it's already a valid https URL, return it as is
  if (url.startsWith('https://') || url.startsWith('http://')) {
    console.log('Valid http(s) URL found');
    return url;
  }
  
  // If it's a valid base64 data URL, return it as is
  if (url.startsWith('data:image')) {
    console.log('Valid data URL found');
    return url;
  }

  // If it's a relative URL starting with /, make it absolute
  if (url.startsWith('/')) {
    console.log('Relative URL found');
    return url;
  }
  
  // If it's a base64 string without the prefix, add it back
  if (url.match(/^[A-Za-z0-9+/=]+$/)) {
    console.log('Raw base64 string found, adding prefix');
    return `data:image/png;base64,${url}`;
  }
  
  // If we get here and the URL is invalid, return empty string
  console.log('Invalid URL format');
  return '';
}

export async function getAllImages(userId: string): Promise<GeneratedImage[]> {
  try {
    console.log('Getting images for user ID:', userId);
    const { db } = await connectToDatabase();
    
    const images = await db
      .collection('images')
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`Found ${images.length} images for user ${userId}`);

    const processedImages = images
      .map(image => {
        const cleanedUrl = cleanImageUrl(image.imageUrl || '');
        console.log('Processing image:', {
          id: image._id.toString(),
          originalUrl: image.imageUrl,
          cleanedUrl,
          hasUrl: !!cleanedUrl,
          prompt: image.prompt
        });
        
        // Only return images with valid URLs
        if (!cleanedUrl) {
          console.warn('Skipping image with invalid URL:', image._id.toString());
          return null;
        }

        return {
          _id: image._id.toString(),
          userId: image.userId,
          prompt: image.prompt || '',
          imageUrl: cleanedUrl,
          createdAt: new Date(image.createdAt || Date.now()).toISOString(),
          settings: {
            width: image.settings?.width || 512,
            height: image.settings?.height || 512,
            model: image.settings?.model || 'default'
          }
        };
      })
      .filter((image): image is GeneratedImage => image !== null); // Filter out null values and type assert

    console.log('Returning processed images:', processedImages.map(img => ({
      id: img._id,
      hasUrl: !!img.imageUrl,
      urlPreview: img.imageUrl ? `${img.imageUrl.substring(0, 50)}...` : 'MISSING',
      prompt: img.prompt
    })));

    return processedImages;
  } catch (error) {
    console.error('Error getting images:', error);
    throw error;
  }
}

export async function getLatestImage(userId: string): Promise<GeneratedImage | null> {
  try {
    const { db } = await connectToDatabase();
    
    const image = await db
      .collection('images')
      .findOne(
        { userId: userId },
        { sort: { createdAt: -1 } }
      );

    if (!image) return null;

    return {
      _id: image._id.toString(),
      userId: image.userId,
      prompt: image.prompt || '',
      imageUrl: cleanImageUrl(image.imageUrl || ''),
      createdAt: new Date(image.createdAt || Date.now()).toISOString(),
      settings: {
        width: image.settings?.width || 512,
        height: image.settings?.height || 512,
        model: image.settings?.model || 'default'
      }
    };
  } catch (error) {
    console.error('Error getting latest image:', error);
    throw error;
  }
}

export async function deleteImage(imageId: string, userId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    
    const result = await db
      .collection('images')
      .deleteOne({
        _id: new ObjectId(imageId),
        userId: userId
      });

    return result.deletedCount === 1;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
} 