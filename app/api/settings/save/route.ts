import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import connectToDatabase from '@/lib/mongodb';

interface UserSettings {
  userId: string;
  theme?: string;
  notifications?: boolean;
  // Add other settings as needed
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { 
        status: 401 
      });
    }

    const settings = await req.json();
    const client = await connectToDatabase();
    const db = client.db();

    await db.collection('user_settings').updateOne(
      { userId: session.user.id },
      { 
        $set: {
          ...settings,
          userId: session.user.id,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true 
    });

  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save settings' 
    }, { 
      status: 500 
    });
  }
} 