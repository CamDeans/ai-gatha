/**
 * API Route for image generation
 * Handles image generation using RunPod with rate limiting and caching
 */
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { connectToDatabase } from '@/lib/db';
import { generateWithRunPod } from '@/lib/ai-providers/runpod';
import { RunPodProvider } from '@/lib/ai-providers/config';

// Helper function to sanitize prompt
function sanitizePrompt(prompt: string): string {
  return prompt
    // Remove zero-width spaces and other invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove all non-ASCII characters
    .replace(/[^\x00-\x7F]/g, '')
    // Convert smart quotes to regular quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove special characters
    .replace(/[^\w\s.,!?-]/g, '')
    // Trim whitespace
    .trim();
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings for image size
    const { db } = await connectToDatabase();
    const userSettings = await db
      .collection('user_settings')
      .findOne({ userId: session.user.id });

    const data = await request.json();
    const { prompt } = data;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Sanitize the prompt
    const sanitizedPrompt = sanitizePrompt(prompt);
    
    // Log the prompt transformation for debugging
    console.log('Prompt transformation:', {
      original: prompt,
      sanitized: sanitizedPrompt,
      byteLength: Buffer.from(sanitizedPrompt).length
    });

    if (!sanitizedPrompt) {
      return NextResponse.json(
        { error: 'Invalid prompt after sanitization' },
        { status: 400 }
      );
    }

    const config: RunPodProvider = {
      id: 'runpod',
      name: 'RunPod',
      apiKey: process.env.RUNPOD_API_KEY!,
      endpointUrl: process.env.RUNPOD_ENDPOINT!,
    };

    // Use default size if user settings don't exist
    const [width, height] = (userSettings?.imageSize || '512x512').split('x').map(Number);
    const imageData = await generateWithRunPod(sanitizedPrompt, config, {
      width,
      height,
    });

    // Save the generation to the images collection
    const imageDoc = {
      userId: session.user.id,
      prompt: sanitizedPrompt,
      originalPrompt: prompt,
      imageUrl: imageData,
      createdAt: new Date(),
      settings: {
        width,
        height,
        model: userSettings?.defaultModel || 'stable-diffusion-v1'
      },
      metadata: {
        engine: 'runpod',
        version: '1.0'
      }
    };

    const result = await db.collection('images').insertOne(imageDoc);
    console.log('Saved image to database:', {
      imageId: result.insertedId,
      userId: session.user.id
    });

    return NextResponse.json({ 
      success: true,
      imageId: result.insertedId,
      imageUrl: imageData 
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
} 