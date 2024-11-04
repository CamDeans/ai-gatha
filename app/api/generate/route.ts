/**
 * API Route for image generation
 * Handles image generation using RunPod with rate limiting and caching
 */
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { runpodFetch } from '@/lib/runpod';

// Validate environment variables at runtime instead of build time
function validateConfig() {
  const RUNPOD_ENDPOINT = process.env.RUNPOD_ENDPOINT;
  const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

  if (!RUNPOD_ENDPOINT || !RUNPOD_API_KEY) {
    return false;
  }
  return true;
}

export async function POST(req: Request) {
  try {
    // Check configuration
    if (!validateConfig()) {
      return NextResponse.json({
        success: false,
        error: 'Service not configured'
      }, { status: 503 });
    }

    // Validate request
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }

    // Generate image
    try {
      const imageData = await runpodFetch(prompt);

      if (!imageData?.output?.[0]?.image) {
        throw new Error('No image data received');
      }

      // Save to MongoDB
      const client = await connectToDatabase();
      const db = client.db('deansight');
      
      await db.collection('images').insertOne({
        prompt,
        imageData: imageData.output[0].image,
        createdAt: new Date()
      });

      return NextResponse.json({
        success: true,
        image: imageData.output[0].image
      });

    } catch (genError) {
      console.error('Image generation error:', genError);
      return NextResponse.json({
        success: false,
        error: genError instanceof Error ? genError.message : 'Failed to generate image'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 