import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { Collection } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { db } = await connectToDatabase();

    const userSettings: Collection = db.collection('user_settings');
    
    // Save settings to user_settings collection
    const result = await userSettings.updateOne(
      { userId: session.user.id },
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (!result.acknowledged) {
      throw new Error('Failed to save settings');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const settings = await db
      .collection('user_settings')
      .findOne({ userId: session.user.id });

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
} 