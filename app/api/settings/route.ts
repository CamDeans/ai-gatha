import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import clientPromise from '@/lib/mongodb'

export interface UserSettings {
  userId: string;
  theme: string;
  imageSize: string;
  defaultStyle: string;
  notifications: boolean;
  autoSave: boolean;
  promptHistory: boolean;
  imageQuality: string;
  defaultScheduler: string;
  updatedAt: Date;
}

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
    const settings = await client
      .db("deansight")
      .collection<UserSettings>("user_settings")
      .findOne({ userId: session.user.id })

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        theme: 'dark',
        imageSize: '512x512',
        defaultStyle: 'photorealistic',
        notifications: true,
        autoSave: true,
        promptHistory: true,
        imageQuality: 'high',
        defaultScheduler: 'DPMSolverMultistep'
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const client = await clientPromise
    const db = client.db("deansight")

    // Validate and sanitize the data
    const validatedData: Partial<UserSettings> = {
      userId: session.user.id,
      theme: data.theme || 'dark',
      imageSize: data.imageSize || '512x512',
      defaultStyle: data.defaultStyle || 'photorealistic',
      notifications: Boolean(data.notifications),
      autoSave: Boolean(data.autoSave),
      promptHistory: Boolean(data.promptHistory),
      imageQuality: data.imageQuality || 'high',
      defaultScheduler: data.defaultScheduler || 'DPMSolverMultistep',
      updatedAt: new Date()
    }

    // Log the update operation for debugging
    console.log('Updating settings:', validatedData)

    const result = await db
      .collection<UserSettings>("user_settings")
      .updateOne(
        { userId: session.user.id },
        { $set: validatedData },
        { upsert: true }
      )

    if (!result.acknowledged) {
      throw new Error('Failed to update settings')
    }

    // Log the success
    console.log('Settings updated successfully:', result)

    return NextResponse.json({ 
      success: true,
      settings: validatedData
    })
  } catch (error) {
    console.error('Settings save error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    )
  }
} 