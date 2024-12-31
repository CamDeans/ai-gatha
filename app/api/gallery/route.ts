import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { getAllImages } from '@/lib/services/imageService';

export async function GET() {
  console.log('=== GALLERY API ROUTE START ===');
  try {
    const session = await auth();
    if (!session?.user) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching images for user:', session.user.email, 'with ID:', session.user.id);
    const images = await getAllImages(session.user.id);
    
    // Validate the images array before returning
    if (!Array.isArray(images)) {
      console.error('Invalid images data:', images);
      return NextResponse.json(
        { error: 'Invalid images data returned from database' },
        { status: 500 }
      );
    }

    // Log the response we're about to send
    console.log('Sending response:', {
      count: images.length,
      sampleImage: images[0] ? {
        id: images[0]._id,
        hasUrl: !!images[0].imageUrl,
        urlPreview: images[0].imageUrl?.substring(0, 50) + '...'
      } : null
    });

    // Return just the images array
    return NextResponse.json(images);
  } catch (error) {
    console.error('Gallery API error:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  } finally {
    console.log('=== GALLERY API ROUTE END ===');
  }
} 