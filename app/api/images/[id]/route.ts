import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import clientPromise from '@/lib/mongodb';
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

    const client = await clientPromise;
    const db = client.db();

    // Delete the image from MongoDB
    const result = await db.collection('images').deleteOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });

    if (result.deletedCount === 0) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Error deleting image:', error);
    return new NextResponse('Error deleting image', { status: 500 });
  }
} 