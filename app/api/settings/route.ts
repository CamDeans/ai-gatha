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

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const client = await connectToDatabase();
    const db = client.db();
    
    const settings = await db
      .collection<UserSettings>("user_settings")
      .findOne({ userId: session.user.id });

    return NextResponse.json({ 
      success: true, 
      settings: settings || {} 
    });

  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch settings' 
    }, { 
      status: 500 
    });
  }
} 