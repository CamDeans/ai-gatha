import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { imageId } = await req.json()

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('deansight')
    
    const result = await db
      .collection('images')
      .deleteOne({
        _id: new ObjectId(imageId),
        userId: session.user.id // Ensure user can only delete their own images
      })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Image not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gallery delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
} 