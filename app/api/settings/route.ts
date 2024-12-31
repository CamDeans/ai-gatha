import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const settings = await db
      .collection('user_settings')
      .findOne({ userId: session.user.id });

    // If no settings exist, return default settings
    if (!settings) {
      const defaultSettings: UserSettings = {
        userId: session.user.id,
        imageSize: '512x512',
        defaultModel: 'stable-diffusion',
        promptHistory: true,
        runpodApiKey: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create default settings
      await db.collection('user_settings').insertOne(defaultSettings);
      return NextResponse.json(defaultSettings);
    }

    // Ensure runpodApiKey is included in the response
    const sanitizedSettings = {
      ...settings,
      runpodApiKey: settings.runpodApiKey || '',
    };

    return NextResponse.json(sanitizedSettings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await request.json();
    const { db } = await connectToDatabase();
    
    // Validate settings before saving
    const sanitizedSettings = {
      userId: session.user.id,
      imageSize: settings.imageSize || '512x512',
      defaultModel: settings.defaultModel || 'stable-diffusion',
      promptHistory: Boolean(settings.promptHistory),
      runpodApiKey: settings.runpodApiKey || '',
      updatedAt: new Date()
    };
    
    const result = await db.collection('user_settings').updateOne(
      { userId: session.user.id },
      { 
        $set: sanitizedSettings
      },
      { upsert: true }
    );

    if (!result.acknowledged) {
      throw new Error('Failed to save settings');
    }

    return NextResponse.json({ success: true, settings: sanitizedSettings });

  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
} 