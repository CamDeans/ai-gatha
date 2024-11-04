import { NextResponse } from 'next/server';
import { WithId, Document } from 'mongodb';
import connectToDatabase from '@/lib/mongodb';

interface ImageDocument extends WithId<Document> {
  prompt: string;
  imageData: string;
  createdAt: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const client = await connectToDatabase();
    const db = client.db('deansight');
    
    console.log('Connected to database, fetching images...');
    
    const images = await db
      .collection<ImageDocument>('images')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log(`Found ${images.length} images`);

    const processedImages = images
      .map((img) => {
        if (!img.imageData || typeof img.imageData !== 'string') {
          console.error('Invalid image data for image:', img._id);
          return null;
        }

        try {
          const imageData = img.imageData.replace(/^data:image\/\w+;base64,/, '');
          
          return {
            id: img._id.toString(),
            prompt: img.prompt,
            imageUrl: imageData,
            createdAt: img.createdAt.toISOString()
          };
        } catch (error) {
          console.error('Error processing image:', img._id, error);
          return null;
        }
      })
      .filter(Boolean);

    console.log(`Processed ${processedImages.length} images successfully`);

    return NextResponse.json({ 
      success: true, 
      images: processedImages 
    });
  } catch (error) {
    console.error('Gallery error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch images',
      images: [] 
    }, { 
      status: 500 
    });
  }
} 