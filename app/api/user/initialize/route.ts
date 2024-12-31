import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectToDatabase } from '@/lib/db';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Check if user settings already exist
    const existingSettings = await db
      .collection('user_settings')
      .findOne({ userId: session.user.id });

    if (existingSettings) {
      return NextResponse.json({ message: 'Settings already initialized' });
    }

    // Initialize default user settings
    const defaultSettings = {
      userId: session.user.id,
      imageSize: '512x512',
      defaultModel: 'stable-diffusion-v1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('user_settings').insertOne(defaultSettings);

    return NextResponse.json({ 
      success: true, 
      message: 'User settings initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing user settings:', error);
    return NextResponse.json(
      { error: 'Failed to initialize user settings' },
      { status: 500 }
    );
  }
} 