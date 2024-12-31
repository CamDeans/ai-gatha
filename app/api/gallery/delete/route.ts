import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return new NextResponse('Image ID is required', { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('images').deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id // Ensure user owns the image
    });

    if (result.deletedCount === 0) {
      return new NextResponse('Image not found or unauthorized', { status: 404 });
    }

    return new NextResponse('Image deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting image:', error);
    return new NextResponse('Error deleting image', { status: 500 });
  }
} 