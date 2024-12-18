import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from "@/auth";
import clientPromise from '@/lib/mongodb';
import type { MongoImage } from '@/types/mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('deansight');

    const result = await db.collection<MongoImage>('images').deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id // Ensure users can only delete their own images
    });

    if (!result.deletedCount) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 