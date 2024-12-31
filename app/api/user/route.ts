export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse('Error fetching user', { status: 500 });
  }
} 