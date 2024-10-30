import { NextResponse } from 'next/server'
import { auth } from "@/auth"
import clientPromise from '@/lib/mongodb'

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const settings = await req.json()
    const client = await clientPromise
    const db = client.db('deansight')

    await db.collection('user_settings').updateOne(
      { userId: session.user.id },
      {
        $set: {
          ...settings,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings save error:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
} 