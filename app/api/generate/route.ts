/**
 * API Route for image generation
 * Handles image generation using RunPod with rate limiting and caching
 */
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { runpodFetch } from '@/lib/runpod';
import { rateLimit } from '@/lib/rate-limit';
import clientPromise from '@/lib/mongodb';
import type { MongoImage } from '@/types/mongodb';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: rateLimitResult.message }, { status: 429 });
    }

    // Validate request
    const { prompt } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate image
    const result = await runpodFetch(prompt);
    
    if (!result?.output?.[0]?.image) {
      throw new Error('No image data received from generation');
    }

    // Save to database with proper structure
    const client = await clientPromise;
    const db = client.db('deansight');
    
    const imageDoc = {
      userId: session.user.id,
      prompt,
      imageUrl: result.output[0].image,
      createdAt: new Date(),
      metadata: {
        model: 'stable-diffusion',
        settings: {}
      }
    } as const;

    // Debug log before saving
    console.log('Saving image:', {
      userId: imageDoc.userId,
      promptLength: imageDoc.prompt.length,
      imageUrlLength: imageDoc.imageUrl.length,
    });

    const saveResult = await db.collection('images').insertOne(imageDoc);

    // Debug log after saving
    console.log('Image saved:', {
      id: saveResult.insertedId,
      success: saveResult.acknowledged
    });

    return NextResponse.json({
      success: true,
      image: result.output[0].image
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
} 