import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    
    const settings = await db
      .collection('settings')
      .findOne({});

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();
    
    const result = await db
      .collection('settings')
      .updateOne(
        {},
        { $set: { apiKey } },
        { upsert: true }
      );

    if (!result.acknowledged) {
      throw new Error('Failed to update settings');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 