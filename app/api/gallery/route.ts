import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import clientPromise from '@/lib/mongodb';
import type { MongoImage } from '@/types/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('\n=== GALLERY API ROUTE START ===');
    
    const session = await auth();
    if (!session?.user?.id) {
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 Session user:', {
      userId: session.user.id,
      email: session.user.email
    });

    const client = await clientPromise;
    const db = client.db('deansight');
    
    console.log('📁 Connected to database:', db.databaseName);

    // Query only for the current user's images
    const images = await db.collection<MongoImage>('images')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Found images:', {
      total: images.length,
      userId: session.user.id,
      sampleImage: images[0] ? {
        id: images[0]._id,
        userId: images[0].userId,
        hasImageUrl: !!images[0].imageUrl
      } : null
    });

    console.log('=== GALLERY API ROUTE END ===\n');

    return NextResponse.json({
      success: true,
      images: images.map(img => ({
        id: img._id.toString(),
        userId: img.userId,
        prompt: img.prompt,
        imageUrl: img.imageUrl,
        createdAt: img.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('❌ Gallery error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch images', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 