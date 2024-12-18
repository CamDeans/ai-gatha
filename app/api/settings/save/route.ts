import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await req.json();
    const client = await connectToDatabase();
    const db = client.db();

    const result = await db.collection('user_settings').updateOne(
      { userId: session.user.id },
      { $set: settings },
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
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();

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