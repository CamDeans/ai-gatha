/**
 * API Route for image generation
 * Handles image generation using RunPod with rate limiting and caching
 */
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import clientPromise from '@/lib/mongodb';
import { rateLimit } from '@/lib/rate-limit';
import { cacheImage, getCachedImage } from '@/lib/cache';
import { AI_PROVIDERS } from '@/lib/ai-providers/config';
import { generateWithRunPod } from '@/lib/ai-providers/runpod';

interface GenerateRequest {
  prompt: string;
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please sign in to generate images' },
        { status: 401 }
      );
    }

    // Parse request body
    const { prompt } = await req.json() as GenerateRequest;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimitResult = await rateLimit(session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    // Check cache
    const cacheKey = `image:${session.user.id}:${prompt}`;
    const cachedUrl = await getCachedImage(cacheKey);
    if (cachedUrl) {
      return NextResponse.json({ imageUrl: cachedUrl });
    }

    // Generate image using RunPod
    const imageUrl = await generateWithRunPod(prompt, AI_PROVIDERS.RUNPOD);

    if (!imageUrl) {
      throw new Error('No image was generated');
    }

    // Cache the result
    await cacheImage(cacheKey, imageUrl);

    // Save to database
    const client = await clientPromise;
    const db = client.db('deansight');
    await db.collection('images').insertOne({
      userId: session.user.id,
      prompt,
      imageUrl,
      model: 'runpod',
      createdAt: new Date(),
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
} 