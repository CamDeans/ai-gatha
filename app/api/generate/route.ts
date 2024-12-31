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

// Helper function to validate RunPod API key
function isValidRunPodApiKey(apiKey: string): boolean {
  const trimmedKey = apiKey.trim();
  return trimmedKey.length > 0;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings first
    const { db } = await connectToDatabase();
    const userSettings = await db
      .collection('user_settings')
      .findOne({ userId: session.user.id });

    if (!userSettings?.runpodApiKey) {
      return NextResponse.json(
        { error: 'RunPod API key not configured. Please configure it in settings.' },
        { status: 400 }
      );
    }

    // Log API key details (masked)
    const maskedKey = userSettings.runpodApiKey.replace(/./g, '*');
    console.log('API Key from Settings:', {
      length: userSettings.runpodApiKey.length,
      format: maskedKey,
      firstFour: userSettings.runpodApiKey.slice(0, 4),
      lastFour: userSettings.runpodApiKey.slice(-4),
    });

    // Basic validation - just ensure it's not empty
    if (!isValidRunPodApiKey(userSettings.runpodApiKey)) {
      return NextResponse.json(
        { error: 'RunPod API key cannot be empty' },
        { status: 400 }
      );
    }

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
      apiKey: userSettings.runpodApiKey,
      endpointUrl: process.env.RUNPOD_ENDPOINT!,
    };

    const [width, height] = userSettings.imageSize.split('x').map(Number);
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
        model: userSettings.defaultModel
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