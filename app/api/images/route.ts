import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { config } from '@/auth';
import { getAllImages } from '@/lib/services/imageService';

export async function GET() {
  try {
    const session = await getServerSession(config);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const images = await getAllImages(userId);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 