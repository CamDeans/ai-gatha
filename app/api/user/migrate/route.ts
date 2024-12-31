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
    
    // Remove runpodApiKey from all user settings
    const result = await db.collection('user_settings').updateMany(
      {},
      { 
        $unset: { runpodApiKey: "" },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'User settings migrated successfully',
      modified: result.modifiedCount
    });
  } catch (error) {
    console.error('Error migrating user settings:', error);
    return NextResponse.json(
      { error: 'Failed to migrate user settings' },
      { status: 500 }
    );
  }
} 