import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  console.log('=== TEST GALLERY API START ===');
  try {
    const { db } = await connectToDatabase();
    
    // Simple query without any filters or transformations
    const images = await db
      .collection('images')
      .find({})
      .limit(5)
      .toArray();
    
    console.log('Raw database response:', {
      count: images.length,
      sample: images[0] ? {
        id: images[0]._id,
        hasUrl: !!images[0].imageUrl
      } : null
    });

    // Minimal transformation
    const simpleData = images.map(img => ({
      _id: img._id.toString(),
      prompt: img.prompt || 'No prompt',
      imageUrl: img.imageUrl || ''
    }));

    return NextResponse.json(simpleData);
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test API failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    console.log('=== TEST GALLERY API END ===');
  }
} 