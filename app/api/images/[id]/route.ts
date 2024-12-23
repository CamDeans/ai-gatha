import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return new NextResponse("Invalid image ID", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('deansight');

    const image = await db.collection('images').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });

    if (!image) {
      return new NextResponse("Not found", { status: 404 });
    }

    // If the image is stored as base64
    if (image.imageUrl.startsWith('data:image')) {
      // Extract the MIME type
      const mimeMatch = image.imageUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      
      // Extract the base64 data
      const base64Data = image.imageUrl.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const response = new NextResponse(buffer);
      response.headers.set('Content-Type', mimeType);
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return response;
    }

    // If it's a URL, return a redirect response
    if (image.imageUrl.startsWith('http')) {
      return NextResponse.redirect(image.imageUrl);
    }

    return new NextResponse("Invalid image format", { status: 400 });

  } catch (error) {
    console.error('[IMAGE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return new NextResponse("Invalid image ID", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('deansight');

    // Log for debugging
    console.log('Attempting to delete image:', {
      imageId: params.id,
      userId: session.user.id,
      database: db.databaseName
    });

    // First, find the image to verify it exists and belongs to the user
    const image = await db.collection('images').findOne({
      _id: new ObjectId(params.id)
    });

    console.log('Found image:', image);

    if (!image) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Verify ownership
    if (image.userId.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await db.collection('images').deleteOne({
      _id: new ObjectId(params.id)
    });

    // Log the result
    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[IMAGE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 