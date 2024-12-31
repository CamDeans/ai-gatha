import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { deleteImage } from "@/lib/services/imageService";

export async function DELETE(
  request: Request,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const success = await deleteImage(params.imageId, session.user.id);
    
    if (!success) {
      return new NextResponse('Image not found or unauthorized', { status: 404 });
    }

    return new NextResponse('Image deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting image:', error);
    return new NextResponse('Error deleting image', { status: 500 });
  }
} 