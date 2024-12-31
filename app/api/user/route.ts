import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const email = request.headers.get('x-user-email');
    if (!email) {
      return NextResponse.json({ error: 'No email provided' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      userId: user.userId || user.email,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 