import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db('deansight')
    
    const images = await db
      .collection('images')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedImages = images.map(image => ({
      id: image._id.toString(),
      imageUrl: image.imageUrl,
      prompt: image.prompt,
      createdAt: image.createdAt
    }))

    return NextResponse.json(formattedImages)
  } catch (error) {
    console.error('Gallery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
} 