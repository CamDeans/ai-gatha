import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prismadb from '@/lib/prismadb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Log for debugging
    console.log('Fetching image:', {
      imageId: params.id,
      userId: session.user.id
    });

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      console.error('Invalid ObjectId:', params.id);
      return new NextResponse("Invalid image ID", { status: 400 });
    }

    const image = await prismadb.image.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      select: {
        id: true,
        imageUrl: true,
        prompt: true,
        userId: true,
      },
    });

    // Log for debugging
    console.log('Found image:', {
      found: !!image,
      hasUrl: image?.imageUrl ? 'yes' : 'no',
      userId: image?.userId,
      requestUserId: session.user.id
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

    // If neither base64 nor URL, return error
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const image = await prismadb.image.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('[IMAGE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 