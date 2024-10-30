import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import { uploadToS3 } from '@/lib/storage/s3'

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')

    // Generate unique key for S3
    const key = `uploads/${session.user.id}/${Date.now()}-${file.name}`
    
    // Upload to S3
    const imageUrl = await uploadToS3(base64, key)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
} 